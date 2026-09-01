import { getCloudflareContext } from "@opennextjs/cloudflare";
import { calculatePrice, type Material } from "./materials";
import { itemsTotal, parseItems, type JobItem } from "./job-items";

export type OrderStatus = "pendiente" | "produccion" | "terminado" | "terminado_pagado";

export interface Order {
  id: number;
  file_number: string | null;
  client_name: string;
  job_name: string;
  status: OrderStatus;
  delivered_on_time: 0 | 1 | null; // null = todavía no se entregó
  has_deposit: 0 | 1;
  deposit_amount: number;
  total_amount: number; // = suma de unitPrice*quantity de los items
  form_paid: 0 | 1 | null; // null = sin especificar
  due_date: string | null;
  items: string; // JSON — usar parseItems() de lib/job-items.ts
  paid_at: string | null; // cuándo pasó a 'terminado_pagado'
  created_at: string;
}

/** Número de presupuesto: no se guarda, se deriva del id (correlativo único de D1). */
export function budgetNumber(order: Order): string {
  return `PRES-${order.id}`;
}

/** Saldo pendiente de cobro: no se guarda, se deriva siempre del total y la seña actuales. */
export function getBalance(order: Order): number {
  return order.total_amount - (order.has_deposit ? order.deposit_amount : 0);
}

/** ¿El pedido está terminado y cobrado? — señal para Finanzas / Resumen. */
export function isPaid(order: Order): boolean {
  return order.status === "terminado_pagado";
}

/** Costo/margen real del pedido: suma el costo (material + mano de obra) de
 * cada item que tenga material y medidas cargadas, con la fórmula del
 * Cotizador. Devuelve null si ningún item tiene datos suficientes — así
 * Finanzas sabe qué pedidos entran en las estadísticas sin inventar un número. */
export function getOrderCost(
  order: Order,
  materialsById: Map<number, Material>,
  moPerMinute: number
): { cost: number; margin: number; marginPct: number } | null {
  let cost = 0;
  let counted = 0;
  for (const item of parseItems(order.items)) {
    if (item.materialId === null || item.widthMm === null || item.lengthMm === null) continue;
    const bd = calculatePrice(
      item.widthMm,
      item.lengthMm,
      item.moMinutes ?? 0,
      materialsById.get(item.materialId),
      moPerMinute,
      0,
      0
    );
    if (!bd) continue;
    cost += (bd.materialCost + bd.laborCost) * (item.quantity || 1);
    counted++;
  }
  if (counted === 0) return null;
  const margin = order.total_amount - cost;
  const marginPct = order.total_amount > 0 ? (margin / order.total_amount) * 100 : 0;
  return { cost, margin, marginPct };
}

/** Sin `sinceDate`: trae todo. Con `sinceDate`, trae los recientes MÁS los
 * que igual hace falta ver siempre: no cerrados (trabajo en curso) o con
 * saldo pendiente. Pensado para cuando `orders` crezca mucho. */
export async function getOrders(sinceDate?: string): Promise<Order[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (sinceDate) {
      const { results } = await env.DB.prepare(
        `SELECT * FROM orders
         WHERE created_at >= ?
            OR status NOT IN ('terminado', 'terminado_pagado')
            OR (total_amount - has_deposit * deposit_amount) > 0
         ORDER BY created_at DESC`
      )
        .bind(sinceDate)
        .all<Order>();
      return results;
    }
    const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all<Order>();
    return results;
  } catch (err) {
    console.error("[orders] Error trayendo pedidos:", err);
    return [];
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<Order>();
    return row ?? null;
  } catch (err) {
    console.error("[orders] Error trayendo pedido:", err);
    return null;
  }
}

export function getOrdersByStatus(orders: Order[], status: OrderStatus): Order[] {
  return orders.filter((o) => o.status === status);
}

/** Vencido: tiene fecha de entrega, ya pasó, y todavía no está terminado. */
export function isOverdue(order: Order, today: string = new Date().toISOString().slice(0, 10)): boolean {
  const done = order.status === "terminado" || order.status === "terminado_pagado";
  return !done && order.due_date !== null && order.due_date < today;
}

export function getOnTimeStats(
  orders: Order[],
  today: string = new Date().toISOString().slice(0, 10)
): { onTime: number; late: number; pct: number } {
  const onTime = orders.filter((o) => o.delivered_on_time === 1).length;
  const late = orders.filter((o) => o.delivered_on_time === 0 || (o.delivered_on_time === null && isOverdue(o, today))).length;
  const total = onTime + late;
  const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;
  return { onTime, late, pct };
}

export type OrderInput = {
  file_number: string | null;
  client_name: string;
  job_name: string;
  status: OrderStatus;
  has_deposit: 0 | 1;
  deposit_amount: number;
  due_date: string | null;
  items: JobItem[];
};

export async function createOrder(data: OrderInput): Promise<number> {
  const { env } = await getCloudflareContext({ async: true });
  const total = itemsTotal(data.items);
  const result = await env.DB.prepare(
    `INSERT INTO orders (file_number, client_name, job_name, status, has_deposit, deposit_amount, total_amount, due_date, items)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      data.file_number,
      data.client_name,
      data.job_name,
      data.status,
      data.has_deposit,
      data.deposit_amount,
      total,
      data.due_date,
      JSON.stringify(data.items)
    )
    .run();
  return result.meta.last_row_id;
}

export type OrderUpdateInput = OrderInput & {
  delivered_on_time: 0 | 1 | null;
  form_paid: 0 | 1 | null;
};

export async function updateOrder(id: number, data: OrderUpdateInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const total = itemsTotal(data.items);
  // paid_at: se setea/limpia según el estado, sin pisarlo si ya estaba.
  const paidAtExpr = data.status === "terminado_pagado" ? "COALESCE(paid_at, datetime('now'))" : "NULL";
  await env.DB.prepare(
    `UPDATE orders SET file_number = ?, client_name = ?, job_name = ?, status = ?,
       delivered_on_time = ?, has_deposit = ?, deposit_amount = ?, total_amount = ?, form_paid = ?, due_date = ?,
       items = ?, paid_at = ${paidAtExpr}
     WHERE id = ?`
  )
    .bind(
      data.file_number,
      data.client_name,
      data.job_name,
      data.status,
      data.delivered_on_time,
      data.has_deposit,
      data.deposit_amount,
      total,
      data.form_paid,
      data.due_date,
      JSON.stringify(data.items),
      id
    )
    .run();
}

/** Cambia el estado y, si corresponde, "¿entregado a tiempo?" — usado desde
 * el mini-form de cada card del Kanban. Setea `paid_at` al pasar a
 * 'terminado_pagado' (sin pisarlo si ya estaba); lo limpia si sale de ese estado. */
export async function updateOrderStatus(id: number, status: OrderStatus, deliveredOnTime: 0 | 1 | null): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const paidAtExpr = status === "terminado_pagado" ? "COALESCE(paid_at, datetime('now'))" : "NULL";
  await env.DB.prepare(`UPDATE orders SET status = ?, delivered_on_time = ?, paid_at = ${paidAtExpr} WHERE id = ?`)
    .bind(status, deliveredOnTime, id)
    .run();
}

export async function deleteOrder(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
}
