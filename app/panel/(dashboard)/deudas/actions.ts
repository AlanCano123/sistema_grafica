"use server";

import { revalidatePath } from "next/cache";
import { createDebt, deleteDebt, updateDebt } from "@/lib/business";
import { requireAdmin } from "@/lib/panel-auth";
import { optionalString, requiredNumber, requiredString } from "@/lib/validate";

// Campos de texto opcionales de verdad (description/due_date) -> null si
// vienen vacíos, no "" (así queda igual que antes de esta validación).
function nullableText(formData: FormData, key: string, max: number): string | null {
  const v = optionalString(formData, key, { max });
  return v === "" ? null : v;
}

function debtInput(formData: FormData) {
  return {
    direction: (String(formData.get("direction")) === "payable" ? "payable" : "receivable") as
      | "payable"
      | "receivable",
    counterparty_name: requiredString(formData, "counterparty_name", { max: 150 }),
    amount: requiredNumber(formData, "amount", { min: 0, max: 1_000_000_000 }),
    paid_amount: requiredNumber(formData, "paid_amount", { min: 0, max: 1_000_000_000 }),
    description: nullableText(formData, "description", 500),
    due_date: nullableText(formData, "due_date", 20),
    status: (String(formData.get("status")) === "paid" ? "paid" : "pending") as "paid" | "pending",
  };
}

export async function createDebtAction(formData: FormData) {
  await requireAdmin();
  await createDebt(debtInput(formData));
  revalidatePath("/panel/deudas");
}

export async function updateDebtAction(formData: FormData) {
  await requireAdmin();
  const id = requiredNumber(formData, "id", { min: 1 });
  await updateDebt(id, debtInput(formData));
  revalidatePath("/panel/deudas");
}

export async function deleteDebtAction(formData: FormData) {
  await requireAdmin();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteDebt(id);
  revalidatePath("/panel/deudas");
}
