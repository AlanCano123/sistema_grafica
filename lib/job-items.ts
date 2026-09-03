// Items de un pedido / presupuesto. Se guardan como JSON en
// `orders.items` y `quotes.items` (sin tabla aparte — escala chica, mismo
// criterio que ya tenían los presupuestos). Sin acceso a D1 acá: lo
// importan tanto el Cotizador (client) como las páginas server.
import { calculatePrice, type Material } from "./materials";
import { isProvider, type Provider } from "./providers";

export type PriceMode = "mayorista" | "minorista" | "manual";

export interface JobItem {
  description: string;
  quantity: number;
  unitPrice: number; // precio unitario elegido/editado
  priceMode: PriceMode;
  materialId: number | null;
  widthMm: number | null;
  lengthMm: number | null;
  moMinutes: number | null;
  serviceType: string | null; // value de SERVICE_TYPES
  provider: Provider | null; // de qué proveedor sale el artículo (para comprar/revender)
}

export const EMPTY_JOB_ITEM: JobItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  priceMode: "manual",
  materialId: null,
  widthMm: null,
  lengthMm: null,
  moMinutes: null,
  serviceType: null,
  provider: null,
};

/** Normaliza un valor cualquiera (viene de JSON.parse, puede tener shape
 * viejo `{ description, quantity, unitPrice }`) a un JobItem completo. */
export function normalizeItem(raw: unknown): JobItem {
  const r = (raw ?? {}) as Record<string, unknown>;
  const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const numOrNull = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    description: typeof r.description === "string" ? r.description : "",
    quantity: num(r.quantity) || 1,
    unitPrice: num(r.unitPrice),
    priceMode: r.priceMode === "mayorista" || r.priceMode === "minorista" ? r.priceMode : "manual",
    materialId: numOrNull(r.materialId),
    widthMm: numOrNull(r.widthMm),
    lengthMm: numOrNull(r.lengthMm),
    moMinutes: numOrNull(r.moMinutes),
    serviceType: typeof r.serviceType === "string" && r.serviceType !== "" ? r.serviceType : null,
    provider: isProvider(r.provider) ? r.provider : null,
  };
}

export function parseItems(json: string | null | undefined): JobItem[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.map(normalizeItem) : [];
  } catch {
    return [];
  }
}

export function itemSubtotal(item: JobItem): number {
  return item.quantity * item.unitPrice;
}

export function itemsTotal(items: JobItem[]): number {
  return items.reduce((sum, i) => sum + itemSubtotal(i), 0);
}

export interface ItemBreakdown {
  materialCost: number;
  laborCost: number;
  finalCost: number;
  wholesaleMargin: number;
  wholesaleUnit: number; // precio mayorista unitario
  retailMargin: number;
  retailUnit: number; // precio minorista unitario
  wholesaleLine: number; // wholesaleUnit * quantity
  retailLine: number; // retailUnit * quantity
}

/** Desglose completo de un item (mismo que el Cotizador viejo: costo
 * material + MO, costo final, márgenes y precios mayorista/minorista), más
 * los totales × cantidad. `null` si al item le falta material o medidas. */
export function itemBreakdown(
  item: { materialId: number | null; widthMm: number | null; lengthMm: number | null; moMinutes: number | null; quantity: number },
  materialsById: Map<number, Material>,
  moPerMinute: number,
  wholesalePct: number,
  retailPct: number
): ItemBreakdown | null {
  if (item.materialId === null || item.widthMm === null || item.lengthMm === null) return null;
  const material = materialsById.get(item.materialId);
  const bd = calculatePrice(item.widthMm, item.lengthMm, item.moMinutes ?? 0, material, moPerMinute, wholesalePct, retailPct);
  if (!bd) return null;
  const qty = item.quantity || 0;
  return {
    materialCost: bd.materialCost,
    laborCost: bd.laborCost,
    finalCost: bd.finalCost,
    wholesaleMargin: bd.wholesaleMargin,
    wholesaleUnit: bd.wholesalePrice,
    retailMargin: bd.retailMargin,
    retailUnit: bd.retailPrice,
    wholesaleLine: bd.wholesalePrice * qty,
    retailLine: bd.retailPrice * qty,
  };
}
