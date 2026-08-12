import { Category, Product } from "./types";

/** Imagen principal del producto: la del primer variante, o un placeholder */
export function getMainImage(product: Product): string {
  return (
    product.variants?.[0]?.picture?.medium ??
    product.variants?.[0]?.picture?.small ??
    "/placeholder.svg"
  );
}

/** Rango de precio neto entre todos los variantes (suele variar por color) */
export function getPriceRange(product: Product): { min: number; max: number } {
  const prices = product.variants.map((v) => parseFloat(v.net_price)).filter((p) => !isNaN(p));
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
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
