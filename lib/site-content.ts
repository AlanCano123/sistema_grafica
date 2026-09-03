import { getCloudflareContext } from "@opennextjs/cloudflare";

// Contenido editable del sitio público que no justifica una tabla D1 —
// vive como un blob JSON en KV (clave `site:...`). Se edita en /panel/sitio.

export interface GrabadoTier {
  label: string;
  price: string; // texto libre, ej. "$5.000" — Fernando lo escribe como quiere
}

export const DEFAULT_GRABADOS: GrabadoTier[] = [
  { label: "Grabado común", price: "$5.000" },
  { label: "Grabado medio", price: "$9.000" },
  { label: "Grabado full", price: "$15.000" },
  { label: "Grabado 360°", price: "$20.000" },
];

const GRABADOS_KEY = "site:grabados";

export async function getGrabadosPricing(): Promise<GrabadoTier[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const raw = (await env.KV.get(GRABADOS_KEY, "json")) as Partial<GrabadoTier>[] | null;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((t) => ({ label: String(t?.label ?? "").trim(), price: String(t?.price ?? "").trim() }))
        .filter((t) => t.label !== "");
    }
  } catch (err) {
    console.error("[site-content] Error leyendo grabados de KV:", err);
  }
  return DEFAULT_GRABADOS;
}

export async function setGrabadosPricing(items: GrabadoTier[]): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.KV.put(GRABADOS_KEY, JSON.stringify(items));
}
