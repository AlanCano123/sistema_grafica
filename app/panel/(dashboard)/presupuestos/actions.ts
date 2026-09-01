"use server";

import { revalidatePath } from "next/cache";
import { convertQuoteToOrder, deleteQuote, updateQuoteStatus, type QuoteStatus } from "@/lib/quotes";
import { requireAuth } from "@/lib/panel-auth";
import { requiredNumber } from "@/lib/validate";

export async function updateQuoteStatusAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  const status = String(formData.get("status") ?? "pendiente") as QuoteStatus;
  await updateQuoteStatus(id, status);
  revalidatePath("/panel/presupuestos");
}

export async function deleteQuoteAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteQuote(id);
  revalidatePath("/panel/presupuestos");
}

export async function convertQuoteToOrderAction(data: {
  quoteId: number;
  job_name: string;
  due_date?: string | null;
  has_deposit: boolean;
  deposit_amount: number;
}): Promise<number | null> {
  await requireAuth();
  const jobName = String(data.job_name ?? "").trim().slice(0, 150);
  if (!jobName || !Number.isInteger(data.quoteId) || data.quoteId < 1) return null;
  const dep = Number(data.deposit_amount);
  const orderId = await convertQuoteToOrder(data.quoteId, {
    job_name: jobName,
    due_date: data.due_date ? String(data.due_date).slice(0, 20) : null,
    has_deposit: data.has_deposit ? 1 : 0,
    deposit_amount: Number.isFinite(dep) && dep > 0 ? Math.min(dep, 1_000_000_000) : 0,
  });
  revalidatePath("/panel/presupuestos");
  revalidatePath("/panel/pedidos");
  return orderId;
}
