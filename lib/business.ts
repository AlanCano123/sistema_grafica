import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Debt {
  id: number;
  direction: "receivable" | "payable"; // receivable = te deben | payable = vos debés
  counterparty_name: string;
  amount: number;
  description: string | null;
  due_date: string | null;
  status: "pending" | "paid";
  created_at: string;
}

export interface Sale {
  id: number;
  description: string;
  amount: number;
  sale_date: string;
  client_name: string | null;
  payment_method: string | null; // 'efectivo' | 'transferencia' | 'tarjeta' | 'otro'
  order_id: number | null; // pedido vinculado, si la venta viene de un pedido terminado+cobrado
  service_type: string | null; // ver SERVICE_TYPES
  created_at: string;
}

/** Tipos de servicio para clasificar una venta (para "Ventas por tipo de
 * servicio" en Finanzas) — lista fija, confirmada con Fernando. */
export const SERVICE_TYPES: { value: string; label: string }[] = [
  { value: "corte_laser", label: "Corte láser" },
  { value: "grabado_laser", label: "Grabado láser" },
  { value: "impresion_uv", label: "Impresión UV" },
  { value: "impresion_dtf", label: "Impresión DTF" },
  { value: "impresion_textil", label: "Impresión textil" },
  { value: "corte_polifan", label: "Corte de Polifan" },
  { value: "carteleria_corporea", label: "Cartelería Corpórea" },
  { value: "diseno_personalizado", label: "Diseño Personalizado" },
];

export async function getDebts(): Promise<Debt[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    // "due_date IS NULL" da 0/1: los que tienen fecha (0) van primero,
    // ordenados ascendente; los NULL quedan al final.
    const { results } = await env.DB.prepare(
      "SELECT * FROM debts ORDER BY due_date IS NULL, due_date ASC"
    ).all<Debt>();
    return results;
  } catch (err) {
    console.error("[business] Error trayendo deudas:", err);
    return [];
  }
}

export async function getSales(): Promise<Sale[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { results } = await env.DB.prepare("SELECT * FROM sales ORDER BY sale_date DESC").all<Sale>();
    return results;
  } catch (err) {
    console.error("[business] Error trayendo ventas:", err);
    return [];
  }
}

export type SaleInput = {
  description: string;
  amount: number;
  sale_date: string;
  client_name: string | null;
  payment_method: string | null;
  order_id: number | null;
  service_type: string | null;
};

export async function createSale(data: SaleInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "INSERT INTO sales (description, amount, sale_date, client_name, payment_method, order_id, service_type) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      data.description,
      data.amount,
      data.sale_date,
      data.client_name,
      data.payment_method,
      data.order_id,
      data.service_type
    )
    .run();
}

export async function updateSale(id: number, data: SaleInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "UPDATE sales SET description = ?, amount = ?, sale_date = ?, client_name = ?, payment_method = ?, order_id = ?, service_type = ? WHERE id = ?"
  )
    .bind(
      data.description,
      data.amount,
      data.sale_date,
      data.client_name,
      data.payment_method,
      data.order_id,
      data.service_type,
      id
    )
    .run();
}

export async function deleteSale(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM sales WHERE id = ?").bind(id).run();
}

export async function getSaleByOrderId(orderId: number): Promise<Sale | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT * FROM sales WHERE order_id = ? LIMIT 1").bind(orderId).first<Sale>();
    return row ?? null;
  } catch (err) {
    console.error("[business] Error buscando venta por pedido:", err);
    return null;
  }
}

/** Crea la venta de un pedido Terminado + cobrado, si todavía no existe una
 * ligada a ese pedido (evita duplicar si el pedido se edita de nuevo). */
export async function createSaleFromOrder(order: {
  id: number;
  client_name: string;
  job_name: string;
  total_amount: number;
}): Promise<void> {
  const existing = await getSaleByOrderId(order.id);
  if (existing) return;

  await createSale({
    description: order.job_name,
    amount: order.total_amount,
    sale_date: new Date().toISOString().slice(0, 10),
    client_name: order.client_name,
    payment_method: null,
    order_id: order.id,
    service_type: null, // los pedidos no tienen este concepto — se completa a mano en Ventas si hace falta
  });
}
