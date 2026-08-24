"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale, updateSale } from "@/lib/business";

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const v = String(formData.get(key) ?? "").trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function createSaleAction(formData: FormData) {
  await createSale({
    description: String(formData.get("description") ?? ""),
    amount: parseFloat(String(formData.get("amount") ?? "0")) || 0,
    sale_date: String(formData.get("sale_date") ?? new Date().toISOString().slice(0, 10)),
    client_name: text(formData, "client_name"),
    payment_method: text(formData, "payment_method"),
    order_id: optionalNumber(formData, "order_id"),
    service_type: text(formData, "service_type"),
  });
  revalidatePath("/panel/ventas");
}

export async function updateSaleAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await updateSale(id, {
    description: String(formData.get("description") ?? ""),
    amount: parseFloat(String(formData.get("amount") ?? "0")) || 0,
    sale_date: String(formData.get("sale_date") ?? ""),
    client_name: text(formData, "client_name"),
    payment_method: text(formData, "payment_method"),
    order_id: optionalNumber(formData, "order_id"),
    service_type: text(formData, "service_type"),
  });
  revalidatePath("/panel/ventas");
}

export async function deleteSaleAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteSale(id);
  revalidatePath("/panel/ventas");
}
