import { formatPrice } from "./product-helpers";
import type { CartItem } from "./cart-context";

// Arma el texto del WhatsApp del carrito — sin total sumado (decisión con
// Fernando: son precios estimados, sumar podría dar un número que
// termine estando mal, cierra el número final él mismo por chat).
export function buildCartMessage(items: CartItem[]): string {
  const lines = items.map((item, i) => {
    const price =
      item.priceMin == null
        ? "precio a consultar"
        : item.priceMin === item.priceMax
          ? formatPrice(item.priceMin)
          : `${formatPrice(item.priceMin)} – ${formatPrice(item.priceMax!)}`;
    return `${i + 1}. ${item.name} (Código: ${item.code}) x${item.quantity} — ${price} c/u`;
  });

  return [
    "Hola! Quiero pedir presupuesto por estos productos:",
    "",
    ...lines,
    "",
    "* Los precios son estimados y están sujetos a modificación — no son precios finales.",
  ].join("\n");
}
