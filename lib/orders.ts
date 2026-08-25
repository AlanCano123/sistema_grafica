import { getCloudflareContext } from "@opennextjs/cloudflare";
import { calculatePrice, type Material } from "./materials";

export type OrderStatus = "pendiente" | "produccion" | "terminado";

export interface Order {
  id: number;
  order_number: string;
  file_number: string | null;
  client_name: string;
  job_name: string;
  status: OrderStatus;
  delivered_on_time: 0 | 1 | null; // null = todavía no se entregó
  has_deposit: 0 | 1;
  deposit_amount: number;
  total_amount: number;
  form_paid: 0 | 1 | null; // null = sin especificar
  due_date: string | null;
  // Datos de costo, opcionales — mismos que usa el Cotizador. Si faltan,
  // el pedido simplemente no entra en "Material más solicitado" / "Margen
  // neto por proyecto" de Finanzas (ver getOrderCost).
  material_id: number | null;
  width_mm: number | null;
  length_mm: number | null;
  mo_minutes: number | null;
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

/** Costo/margen real del pedido, misma fórmula que el Cotizador (material +
 * mano de obra). Devuelve null si falta cualquier dato — así Finanzas sabe
 * qué pedidos entran o no en las estadísticas, sin inventar un número. */
export function getOrderCost(
  order: Order,
  material: Material | undefined,
  moPerMinute: number
): { cost: number; margin: number; marginPct: number } | null {
  if (!material || order.width_mm === null || order.length_mm === null || order.mo_minutes === null) {
    return null;
  }
  const breakdown = calculatePrice(order.width_mm, order.length_mm, order.mo_minutes, material, moPerMinute, 0, 0);
  if (!breakdown) return null;

  const cost = breakdown.materialCost + breakdown.laborCost;
  const margin = order.total_amount - cost;
  const marginPct = order.total_amount > 0 ? (margin / order.total_amount) * 100 : 0;
  return { cost, margin, marginPct };
}

/** Sin `sinceDate`: trae todo (comportamiento de siempre). Con `sinceDate`,
 * trae los recientes MÁS los que igual hace falta ver siempre sin importar
 * la fecha: no terminados (trabajo en curso) o con saldo pendiente (plata
 * que falta cobrar) — así el filtro nunca esconde algo que todavía importa,
 * solo pedidos viejos, cerrados y cobrados del todo. Pensado para cuando
 * `orders` crezca mucho (ver análisis de lecturas de D1) — no reduce nada
 * hoy, es la base para no tener que traer la tabla entera siempre. */
export async function getOrders(sinceDate?: string): Promise<Order[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (sinceDate) {
      const { results } = await env.DB.prepare(
        `SELECT * FROM orders
         WHERE created_at >= ?
            OR status != 'terminado'
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

/** Vencido: tiene fecha de entrega, ya pasó, y todavía no está Terminado.
 * No depende de `delivered_on_time` (ese es a mano, solo tiene sentido una
 * vez entregado) — esto es en vivo, cambia solo con la fecha de hoy. */
export function isOverdue(order: Order, today: string = new Date().toISOString().slice(0, 10)): boolean {
  return order.status !== "terminado" && order.due_date !== null && order.due_date < today;
}

export function getOnTimeStats(
  orders: Order[],
  today: string = new Date().toISOString().slice(0, 10)
): { onTime: number; late: number; pct: number } {
  const onTime = orders.filter((o) => o.delivered_on_time === 1).length;
  // "Con retraso" = marcado a mano como tal, o vencido sin entregar todavía
  // (pedido Fernando: si la fecha de entrega ya pasó y no está Terminado,
  // cuenta como retraso aunque no se haya cerrado el pedido).
  const late = orders.filter((o) => o.delivered_on_time === 0 || (o.delivered_on_time === null && isOverdue(o, today))).length;
  const total = onTime + late;
  const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;
  return { onTime, late, pct };
}

export type OrderInput = {
  order_number: string;
  file_number: string | null;
  client_name: string;
  job_name: string;
  status: OrderStatus;
  has_deposit: 0 | 1;
  deposit_amount: number;
  total_amount: number;
  due_date: string | null;
  material_id: number | null;
  width_mm: number | null;
  length_mm: number | null;
  mo_minutes: number | null;
};

export async function createOrder(data: OrderInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `INSERT INTO orders (order_number, file_number, client_name, job_name, status, has_deposit, deposit_amount, total_amount, due_date, material_id, width_mm, length_mm, mo_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      data.order_number,
      data.file_number,
      data.client_name,
      data.job_name,
      data.status,
      data.has_deposit,
      data.deposit_amount,
      data.total_amount,
      data.due_date,
      data.material_id,
      data.width_mm,
      data.length_mm,
      data.mo_minutes
    )
    .run();
}

export type OrderUpdateInput = OrderInput & {
  delivered_on_time: 0 | 1 | null;
  form_paid: 0 | 1 | null;
};

export async function updateOrder(id: number, data: OrderUpdateInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `UPDATE orders SET order_number = ?, file_number = ?, client_name = ?, job_name = ?, status = ?,
       delivered_on_time = ?, has_deposit = ?, deposit_amount = ?, total_amount = ?, form_paid = ?, due_date = ?,
       material_id = ?, width_mm = ?, length_mm = ?, mo_minutes = ?
     WHERE id = ?`
  )
    .bind(
      data.order_number,
      data.file_number,
      data.client_name,
      data.job_name,
      data.status,
      data.delivered_on_time,
      data.has_deposit,
      data.deposit_amount,
      data.total_amount,
      data.form_paid,
      data.due_date,
      data.material_id,
      data.width_mm,
      data.length_mm,
      data.mo_minutes,
      id
    )
    .run();
}

/** Cambia el estado y, si corresponde, "¿entregado a tiempo?" — usado desde
 * el mini-form de cada card del Kanban (esa pregunta solo se muestra ahí
 * cuando el pedido está Terminado). */
export async function updateOrderStatus(id: number, status: OrderStatus, deliveredOnTime: 0 | 1 | null): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("UPDATE orders SET status = ?, delivered_on_time = ? WHERE id = ?")
    .bind(status, deliveredOnTime, id)
    .run();
}

export async function deleteOrder(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
}
