"use server";

import { revalidatePath } from "next/cache";
import { createQuote, type QuoteInput } from "@/lib/quotes";
import { requireAuth } from "@/lib/panel-auth";

/** Llamado directo desde el Client Component (no un <form>) — al descargar
 * un Presupuesto se guarda para poder convertirlo a remito después si el
 * cliente acepta. Devuelve el id para armar el número real (PRES-{id}). */
export async function createQuoteAction(data: QuoteInput): Promise<number> {
  await requireAuth();
  const id = await createQuote(data);
  revalidatePath("/panel/presupuestos");
  return id;
}
