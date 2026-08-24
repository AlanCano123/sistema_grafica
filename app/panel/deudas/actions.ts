"use server";

import { revalidatePath } from "next/cache";
import { createDebt, deleteDebt, updateDebt } from "@/lib/business";

function num(formData: FormData, key: string): number {
  return parseFloat(String(formData.get(key) ?? "0")) || 0;
}

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function createDebtAction(formData: FormData) {
  await createDebt({
    direction: String(formData.get("direction")) === "payable" ? "payable" : "receivable",
    counterparty_name: String(formData.get("counterparty_name") ?? ""),
    amount: num(formData, "amount"),
    paid_amount: num(formData, "paid_amount"),
    description: text(formData, "description"),
    due_date: text(formData, "due_date"),
    status: String(formData.get("status")) === "paid" ? "paid" : "pending",
  });
  revalidatePath("/panel/deudas");
}

export async function updateDebtAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await updateDebt(id, {
    direction: String(formData.get("direction")) === "payable" ? "payable" : "receivable",
    counterparty_name: String(formData.get("counterparty_name") ?? ""),
    amount: num(formData, "amount"),
    paid_amount: num(formData, "paid_amount"),
    description: text(formData, "description"),
    due_date: text(formData, "due_date"),
    status: String(formData.get("status")) === "paid" ? "paid" : "pending",
  });
  revalidatePath("/panel/deudas");
}

export async function deleteDebtAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteDebt(id);
  revalidatePath("/panel/deudas");
}
