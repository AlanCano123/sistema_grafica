// Proveedor de un artículo. En el PANEL se ve el nombre real; en el
// mensaje de WhatsApp del carrito se muestra solo un ALIAS opaco (A/B/C)
// — Fernando no quiere que el cliente vea de qué proveedor sale cada
// cosa, pero él sí necesita saberlo para comprar y revender.
//
//   A = CDO Promocionales   B = Maya Publicidad   C = Producto propio
export type Provider = "cdo" | "maya" | "propio";

export const PROVIDER_LABELS: Record<Provider, string> = {
  cdo: "CDO",
  maya: "Maya",
  propio: "Propio",
};

export const PROVIDER_ALIAS: Record<Provider, string> = {
  cdo: "A",
  maya: "B",
  propio: "C",
};

export const PROVIDER_OPTIONS: { value: Provider; label: string }[] = [
  { value: "cdo", label: "CDO Promocionales" },
  { value: "maya", label: "Maya Publicidad" },
  { value: "propio", label: "Producto propio" },
];

export function isProvider(v: unknown): v is Provider {
  return v === "cdo" || v === "maya" || v === "propio";
}

/** El carrito guarda `key = "${provider}:${code}"` — devuelve el provider. */
export function providerFromCartKey(key: string): Provider | null {
  const p = key.split(":")[0];
  return isProvider(p) ? p : null;
}
