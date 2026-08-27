"use server";

import { revalidatePath } from "next/cache";
import { deleteQuote, updateQuoteStatus, type QuoteStatus } from "@/lib/quotes";
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
