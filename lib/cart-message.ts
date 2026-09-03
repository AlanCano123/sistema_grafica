import { formatPrice } from "./product-helpers";
import { PROVIDER_ALIAS, providerFromCartKey } from "./providers";
import type { CartItem } from "./cart-context";

// Arma el texto del WhatsApp del carrito — sin total sumado (decisión con
// Fernando: son precios estimados, sumar podría dar un número que
// termine estando mal, cierra el número final él mismo por chat).
//
// Cada línea termina con una referencia opaca (A/B/C) que es el proveedor
// del artículo — el cliente no sabe qué significa, Fernando sí (ver
// lib/providers.ts). Así puede saber a quién comprarle sin mostrarle al
// cliente los nombres de los proveedores.
export function buildCartMessage(items: CartItem[]): string {
  const lines = items.map((item, i) => {
    const price =
      item.priceMin == null
        ? "precio a consultar"
        : item.priceMin === item.priceMax
          ? formatPrice(item.priceMin)
          : `${formatPrice(item.priceMin)} – ${formatPrice(item.priceMax!)}`;
    const provider = providerFromCartKey(item.key);
    const ref = provider ? ` · ref. ${PROVIDER_ALIAS[provider]}` : "";
    return `${i + 1}. ${item.name} (Código: ${item.code}) x${item.quantity} — ${price} c/u${ref}`;
  });

  return [
    "Hola! Quiero pedir presupuesto por estos productos:",
    "",
    ...lines,
    "",
    "* Los precios son estimados y están sujetos a modificación — no son precios finales.",
  ].join("\n");
}
