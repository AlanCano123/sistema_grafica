"use server";

import { revalidatePath } from "next/cache";
import { createOrder, deleteOrder, getOrderById, updateOrder, updateOrderStatus, type OrderStatus } from "@/lib/orders";
import { createSaleFromOrder } from "@/lib/business";

type BalanceCheckable = {
  id: number;
  status: OrderStatus;
  client_name: string;
  job_name: string;
  total_amount: number;
  has_deposit: 0 | 1;
  deposit_amount: number;
};

/** Pedido Terminado + saldo $0 (cobrado del todo) → crea la venta sola.
 * createSaleFromOrder ya chequea que no exista una venta ligada antes de
 * crear otra, así que llamarlo de más (cada vez que se guarda el pedido)
 * no duplica nada. */
async function maybeCreateSale(order: BalanceCheckable) {
  const balance = order.total_amount - (order.has_deposit ? order.deposit_amount : 0);
  if (order.status === "terminado" && balance <= 0) {
    await createSaleFromOrder({
      id: order.id,
      client_name: order.client_name,
      job_name: order.job_name,
      total_amount: order.total_amount,
    });
    revalidatePath("/panel/ventas");
  }
}

function num(formData: FormData, key: string): number {
  return parseFloat(String(formData.get(key) ?? "0")) || 0;
}

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

// Campos de costo (material/medidas/minutos): opcionales, "" = sin cargar.
function optionalNumber(formData: FormData, key: string): number | null {
  const v = String(formData.get(key) ?? "").trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Selects de Sí/No/— usan "" = sin especificar, "1" = sí, "0" = no.
function tri(formData: FormData, key: string): 0 | 1 | null {
  const v = String(formData.get(key) ?? "");
  if (v === "1") return 1;
  if (v === "0") return 0;
  return null;
}

export async function createOrderAction(formData: FormData) {
  await createOrder({
    order_number: String(formData.get("order_number") ?? ""),
    file_number: text(formData, "file_number"),
    client_name: String(formData.get("client_name") ?? ""),
    job_name: String(formData.get("job_name") ?? ""),
    status: (String(formData.get("status") ?? "pendiente") as OrderStatus) || "pendiente",
    has_deposit: formData.get("has_deposit") ? 1 : 0,
    deposit_amount: num(formData, "deposit_amount"),
    total_amount: num(formData, "total_amount"),
    due_date: text(formData, "due_date"),
    material_id: optionalNumber(formData, "material_id"),
    width_mm: optionalNumber(formData, "width_mm"),
    length_mm: optionalNumber(formData, "length_mm"),
    mo_minutes: optionalNumber(formData, "mo_minutes"),
  });
  revalidatePath("/panel/pedidos");
}

export async function updateOrderAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const data = {
    order_number: String(formData.get("order_number") ?? ""),
    file_number: text(formData, "file_number"),
    client_name: String(formData.get("client_name") ?? ""),
    job_name: String(formData.get("job_name") ?? ""),
    status: (String(formData.get("status") ?? "pendiente") as OrderStatus) || "pendiente",
    delivered_on_time: tri(formData, "delivered_on_time"),
    has_deposit: (formData.get("has_deposit") ? 1 : 0) as 0 | 1,
    deposit_amount: num(formData, "deposit_amount"),
    total_amount: num(formData, "total_amount"),
    form_paid: tri(formData, "form_paid"),
    due_date: text(formData, "due_date"),
    material_id: optionalNumber(formData, "material_id"),
    width_mm: optionalNumber(formData, "width_mm"),
    length_mm: optionalNumber(formData, "length_mm"),
    mo_minutes: optionalNumber(formData, "mo_minutes"),
  };
  await updateOrder(id, data);
  await maybeCreateSale({ id, ...data });
  revalidatePath("/panel/pedidos");
}

export async function updateOrderStatusAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "pendiente") as OrderStatus;
  await updateOrderStatus(id, status, tri(formData, "delivered_on_time"));

  // El mini-form del Kanban solo manda el estado — hace falta traer el
  // pedido completo (total/seña) para saber si ya está cobrado del todo.
  const order = await getOrderById(id);
  if (order) await maybeCreateSale(order);

  revalidatePath("/panel/pedidos");
}

export async function deleteOrderAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteOrder(id);
  revalidatePath("/panel/pedidos");
}
