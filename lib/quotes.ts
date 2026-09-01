import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ClientInfo } from "./documents";
import { parseItems, type JobItem } from "./job-items";
import { createOrder } from "./orders";

export type QuoteStatus = "pendiente" | "aceptado" | "rechazado";

export interface Quote {
  id: number;
  client_nombre: string;
  client_domicilio: string | null;
  client_localidad: string | null;
  client_cuit: string | null;
  client_telefono: string | null;
  client_cp: string | null;
  client_provincia: string | null;
  client_otros_datos: string | null;
  items: string; // JSON — usar getQuoteItems() para parsearlo
  total: number;
  status: QuoteStatus;
  order_id: number | null; // pedido creado al aceptar y convertir
  created_at: string;
}

/** Número de presupuesto: no se guarda, se deriva del id. */
export function quoteNumber(quote: Quote): string {
  return `PRES-${quote.id}`;
}

export function getQuoteItems(quote: Quote): JobItem[] {
  return parseItems(quote.items);
}

/** Arma el ClientInfo (mismo shape que el generador de PDF) desde las columnas. */
export function getQuoteClient(quote: Quote): ClientInfo {
  return {
    nombre: quote.client_nombre,
    domicilio: quote.client_domicilio ?? "",
    localidad: quote.client_localidad ?? "",
    cuit: quote.client_cuit ?? "",
    telefono: quote.client_telefono ?? "",
    cp: quote.client_cp ?? "",
    provincia: quote.client_provincia ?? "",
    otrosDatos: quote.client_otros_datos ?? "",
  };
}

export async function getQuotes(): Promise<Quote[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { results } = await env.DB.prepare("SELECT * FROM quotes ORDER BY created_at DESC").all<Quote>();
    return results;
  } catch (err) {
    console.error("[quotes] Error trayendo presupuestos:", err);
    return [];
  }
}

export async function getQuoteById(id: number): Promise<Quote | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(id).first<Quote>();
    return row ?? null;
  } catch (err) {
    console.error("[quotes] Error trayendo presupuesto:", err);
    return null;
  }
}

export type QuoteInput = {
  client: ClientInfo;
  items: JobItem[];
  total: number;
};

/** Devuelve el id del presupuesto creado. */
export async function createQuote(data: QuoteInput): Promise<number> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(
    `INSERT INTO quotes (client_nombre, client_domicilio, client_localidad, client_cuit, client_telefono, client_cp, client_provincia, client_otros_datos, items, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      data.client.nombre,
      data.client.domicilio || null,
      data.client.localidad || null,
      data.client.cuit || null,
      data.client.telefono || null,
      data.client.cp || null,
      data.client.provincia || null,
      data.client.otrosDatos || null,
      JSON.stringify(data.items),
      data.total
    )
    .run();
  return result.meta.last_row_id;
}

export async function updateQuoteStatus(id: number, status: QuoteStatus): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("UPDATE quotes SET status = ? WHERE id = ?").bind(status, id).run();
}

export async function deleteQuote(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM quotes WHERE id = ?").bind(id).run();
}

export type QuoteToOrderInput = {
  job_name: string;
  due_date: string | null;
  has_deposit: 0 | 1;
  deposit_amount: number;
};

/** Convierte un presupuesto aceptado en pedido: crea el pedido con los items
 * y el cliente del presupuesto, y guarda el id del pedido en el presupuesto
 * (para no convertirlo dos veces). Devuelve el id del pedido. */
export async function convertQuoteToOrder(quoteId: number, data: QuoteToOrderInput): Promise<number | null> {
  const quote = await getQuoteById(quoteId);
  if (!quote || quote.order_id !== null) return quote?.order_id ?? null;

  const orderId = await createOrder({
    file_number: null,
    client_name: quote.client_nombre,
    job_name: data.job_name,
    status: "pendiente",
    has_deposit: data.has_deposit,
    deposit_amount: data.deposit_amount,
    due_date: data.due_date,
    items: getQuoteItems(quote),
  });

  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("UPDATE quotes SET order_id = ?, status = 'aceptado' WHERE id = ?").bind(orderId, quoteId).run();
  return orderId;
}
