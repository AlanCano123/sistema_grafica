"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale, updateSale } from "@/lib/business";
import { requireAuth } from "@/lib/panel-auth";
import { requiredNumber, requiredString } from "@/lib/validate";

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
  await requireAuth();
  await createSale({
    description: requiredString(formData, "description", { max: 300 }),
    amount: requiredNumber(formData, "amount", { min: 0, max: 1_000_000_000 }),
    sale_date: String(formData.get("sale_date") ?? new Date().toISOString().slice(0, 10)),
    client_name: text(formData, "client_name"),
    payment_method: text(formData, "payment_method"),
    order_id: optionalNumber(formData, "order_id"),
    service_type: text(formData, "service_type"),
  });
  revalidatePath("/panel/ventas");
}

export async function updateSaleAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await updateSale(id, {
    description: requiredString(formData, "description", { max: 300 }),
    amount: requiredNumber(formData, "amount", { min: 0, max: 1_000_000_000 }),
    sale_date: String(formData.get("sale_date") ?? ""),
    client_name: text(formData, "client_name"),
    payment_method: text(formData, "payment_method"),
    order_id: optionalNumber(formData, "order_id"),
    service_type: text(formData, "service_type"),
  });
  revalidatePath("/panel/ventas");
}

export async function deleteSaleAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteSale(id);
  revalidatePath("/panel/ventas");
}
