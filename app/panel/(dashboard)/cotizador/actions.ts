"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/panel-auth";
import { createQuote } from "@/lib/quotes";
import { createOrder, type OrderStatus } from "@/lib/orders";
import { normalizeItem, type JobItem } from "@/lib/job-items";
import type { ClientInfo } from "@/lib/documents";

function str(v: unknown, max = 200): string {
  return String(v ?? "").trim().slice(0, max);
}
function strOrNull(v: unknown, max = 200): string | null {
  const s = str(v, max);
  return s === "" ? null : s;
}
function money(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 1_000_000_000) : 0;
}
function cleanItems(raw: unknown): JobItem[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map(normalizeItem)
    .filter((i) => i.description.trim() !== "" || i.unitPrice > 0);
}
function cleanClient(raw: unknown): ClientInfo {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    nombre: str(c.nombre, 150),
    domicilio: str(c.domicilio, 200),
    localidad: str(c.localidad, 120),
    cuit: str(c.cuit, 20),
    telefono: str(c.telefono, 40),
    cp: str(c.cp, 20),
    provincia: str(c.provincia, 120),
    otrosDatos: str(c.otrosDatos, 300),
  };
}

/** Guarda un presupuesto. Devuelve el id (para el número PRES-{id} del PDF). */
export async function createQuoteAction(data: { client: unknown; items: unknown }): Promise<number> {
  await requireAuth();
  const items = cleanItems(data.items);
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const id = await createQuote({ client: cleanClient(data.client), items, total });
  revalidatePath("/panel/presupuestos");
  return id;
}

export type CreateOrderInput = {
  file_number?: string | null;
  client_name: string;
  job_name: string;
  due_date?: string | null;
  status?: OrderStatus;
  has_deposit: boolean;
  deposit_amount: number;
  items: unknown;
};

/** Crea un pedido directo desde el Cotizador (sin pasar por presupuesto). */
export async function createOrderFromCotizadorAction(data: CreateOrderInput): Promise<number> {
  await requireAuth();
  const status: OrderStatus =
    data.status && ["pendiente", "produccion", "terminado", "terminado_pagado"].includes(data.status)
      ? data.status
      : "pendiente";
  const id = await createOrder({
    file_number: strOrNull(data.file_number, 60),
    client_name: str(data.client_name, 150),
    job_name: str(data.job_name, 150),
    status,
    has_deposit: data.has_deposit ? 1 : 0,
    deposit_amount: money(data.deposit_amount),
    due_date: strOrNull(data.due_date, 20),
    items: cleanItems(data.items),
  });
  revalidatePath("/panel/pedidos");
  return id;
}
