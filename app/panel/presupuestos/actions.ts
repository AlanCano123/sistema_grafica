"use server";

import { revalidatePath } from "next/cache";
import { deleteQuote, updateQuoteStatus, type QuoteStatus } from "@/lib/quotes";

export async function updateQuoteStatusAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "pendiente") as QuoteStatus;
  await updateQuoteStatus(id, status);
  revalidatePath("/panel/presupuestos");
}

export async function deleteQuoteAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteQuote(id);
  revalidatePath("/panel/presupuestos");
}
