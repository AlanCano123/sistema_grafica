import { Category, Product } from "./types";

/** Imagen principal del producto: la del primer variante, o un placeholder.
 * Usa "original" (no "medium") — la medium de CDO/Maya es un thumb chico
 * y se ve pixelada estirada al tamaño del card. */
export function getMainImage(product: Product): string {
  return (
    product.variants?.[0]?.picture?.original ??
    product.variants?.[0]?.picture?.medium ??
    product.variants?.[0]?.picture?.small ??
    "/placeholder.svg"
  );
}

// Maya sirve este asset fijo de su sitio (ruta de UI/tema, no de
// /uploads/pictures/... que es donde van las fotos reales) cuando un
// producto no tiene foto propia — es su "imagen temporalmente no
// disponible" con su logo, no una foto real. Confirmado contra datos
// reales del catálogo (se repite igual en decenas de productos distintos).
const MAYA_PLACEHOLDER_PREFIX = "https://mayapublicidad.com/images/ui/image/mp-";

/** True si la imagen principal del producto es el "sin imagen" de Maya (no
 * una foto real) — para sacarlo del catálogo público, no de la vista
 * interna de Proveedores (esa sí necesita ver el feed crudo tal cual). */
export function hasPlaceholderImage(product: Product): boolean {
  return getMainImage(product).startsWith(MAYA_PLACEHOLDER_PREFIX);
}

/** Rango de precio neto entre todos los variantes (suele variar por color) */
export function getPriceRange(product: Product): { min: number; max: number } {
  const prices = product.variants.map((v) => parseFloat(v.net_price)).filter((p) => !isNaN(p));
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Precio de lista vs. precio neto de la variante más barata (para mostrar descuento) */
export function getMainVariantPrices(product: Product): { list: number; net: number } {
  const variant = product.variants.reduce<Product["variants"][number] | undefined>((cheapest, v) => {
    const net = parseFloat(v.net_price);
    if (isNaN(net)) return cheapest;
    if (!cheapest || net < parseFloat(cheapest.net_price)) return v;
    return cheapest;
  }, undefined);

  return {
    list: parseFloat(variant?.list_price ?? "") || 0,
    net: parseFloat(variant?.net_price ?? "") || 0,
  };
}

/** Suma el stock disponible de todos los variantes */
export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + (v.stock_available ?? 0), 0);
}

/** Categorías únicas presentes en el catálogo, ordenadas alfabéticamente */
export function getUniqueCategories(products: Product[]): Category[] {
  const byId = new Map<string, Category>();
  for (const product of products) {
    for (const category of product.categories ?? []) {
      byId.set(String(category.id), category);
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Filtra productos que pertenezcan a la categoría indicada (por id) */
export function filterByCategory(products: Product[], categoryId: string | null): Product[] {
  if (!categoryId) return products;
  return products.filter((p) => p.categories?.some((c) => String(c.id) === categoryId));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

// --- Precio estimado en pesos ---------------------------------------------
// Ni CDO ni Maya traen moneda en su API. Criterio de Fernando: un precio
// crudo con MENOS de 3 cifras (< 100) es USD, 3 cifras o más (>= 100) ya
// está en ARS. Confirmado: CDO siempre da USD (por eso siempre < 100),
// Maya es mixto sin patrón — este chequeo por cifras separa los dos casos
// producto a producto. Todo precio mostrado —convertido de USD o ya en
// ARS— lleva +100% (es precio de proveedor mayorista en los dos casos).
// Son precios ESTIMADOS, se muestran siempre con esa aclaración en la UI.

export function looksLikeUsd(rawValue: number): boolean {
  return rawValue < 100;
}

/**
 * Precio final estimado en pesos para un valor crudo de proveedor.
 * `null` si el valor parece USD y no hay cotización de dólar disponible
 * (las dos fuentes de lib/dolar.ts fallaron) — nunca se inventa un número.
 */
export function estimateArsPrice(rawValue: number, dolarVenta: number | null): number | null {
  if (looksLikeUsd(rawValue)) {
    return dolarVenta == null ? null : rawValue * dolarVenta * 2;
  }
  return rawValue * 2;
}

/** Rango de precio ESTIMADO (en pesos) entre todos los variantes. `null` si ninguno se pudo estimar. */
export function getEstimatedPriceRange(product: Product, dolarVenta: number | null): { min: number; max: number } | null {
  const prices = product.variants
    .map((v) => parseFloat(v.net_price))
    .filter((p) => !isNaN(p))
    .map((raw) => estimateArsPrice(raw, dolarVenta))
    .filter((p): p is number => p != null);

  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
