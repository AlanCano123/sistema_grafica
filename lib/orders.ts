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

export async function getOrders(): Promise<Order[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
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

export function getOnTimeStats(orders: Order[]): { onTime: number; late: number; pct: number } {
  const delivered = orders.filter((o) => o.delivered_on_time !== null);
  const onTime = delivered.filter((o) => o.delivered_on_time === 1).length;
  const late = delivered.length - onTime;
  const pct = delivered.length > 0 ? Math.round((onTime / delivered.length) * 100) : 0;
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

/** Solo cambia el estado (usado desde el mini-form de cada card del Kanban).
 * "Entregado a tiempo" se maneja aparte, desde Cuentas corrientes, para no
 * mezclar dos cosas en un mismo mini-form. */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function deleteOrder(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
}
