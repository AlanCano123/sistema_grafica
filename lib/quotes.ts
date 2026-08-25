import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ClientInfo, DocumentItem } from "./documents";

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
  created_at: string;
}

/** Número de presupuesto: no se guarda, se deriva del id (mismo criterio
 * que budgetNumber() en lib/orders.ts). */
export function quoteNumber(quote: Quote): string {
  return `PRES-${quote.id}`;
}

export function getQuoteItems(quote: Quote): DocumentItem[] {
  try {
    return JSON.parse(quote.items) as DocumentItem[];
  } catch {
    return [];
  }
}

/** Arma el ClientInfo (mismo shape que usa el generador de PDF) a partir de
 * las columnas guardadas — para pasarlo directo a RemitoDocument al
 * convertir un presupuesto aceptado. */
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

export type QuoteInput = {
  client: ClientInfo;
  items: DocumentItem[];
  total: number;
};

/** Devuelve el id del presupuesto creado (para armar el número en el PDF
 * que se descarga en el mismo momento). */
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
