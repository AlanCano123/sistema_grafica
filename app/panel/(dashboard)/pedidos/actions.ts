"use server";

import { revalidatePath } from "next/cache";
import { deleteOrder, updateOrder, updateOrderStatus, type OrderStatus } from "@/lib/orders";
import { normalizeItem, type JobItem } from "@/lib/job-items";
import { requireAuth } from "@/lib/panel-auth";
import { requiredNumber, requiredString } from "@/lib/validate";

const STATUSES: OrderStatus[] = ["pendiente", "produccion", "terminado", "terminado_pagado"];

function num(formData: FormData, key: string): number {
  return parseFloat(String(formData.get(key) ?? "0")) || 0;
}

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

// Selects de Sí/No/— usan "" = sin especificar, "1" = sí, "0" = no.
function tri(formData: FormData, key: string): 0 | 1 | null {
  const v = String(formData.get(key) ?? "");
  if (v === "1") return 1;
  if (v === "0") return 0;
  return null;
}

function statusOf(formData: FormData): OrderStatus {
  const v = String(formData.get("status") ?? "pendiente") as OrderStatus;
  return STATUSES.includes(v) ? v : "pendiente";
}

function itemsOf(formData: FormData): JobItem[] {
  try {
    const arr = JSON.parse(String(formData.get("items") ?? "[]"));
    return Array.isArray(arr) ? arr.map(normalizeItem) : [];
  } catch {
    return [];
  }
}

export async function updateOrderAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await updateOrder(id, {
    file_number: text(formData, "file_number"),
    client_name: requiredString(formData, "client_name", { max: 150 }),
    job_name: requiredString(formData, "job_name", { max: 150 }),
    status: statusOf(formData),
    delivered_on_time: tri(formData, "delivered_on_time"),
    has_deposit: (formData.get("has_deposit") ? 1 : 0) as 0 | 1,
    deposit_amount: num(formData, "deposit_amount"),
    form_paid: tri(formData, "form_paid"),
    due_date: text(formData, "due_date"),
    items: itemsOf(formData),
  });
  revalidatePath("/panel/pedidos");
  revalidatePath("/panel/cuentas");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await updateOrderStatus(id, statusOf(formData), tri(formData, "delivered_on_time"));
  revalidatePath("/panel/pedidos");
  revalidatePath("/panel/cuentas");
}

export async function deleteOrderAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteOrder(id);
  revalidatePath("/panel/pedidos");
  revalidatePath("/panel/cuentas");
}
