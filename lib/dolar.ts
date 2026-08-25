// Dólar oficial para estimar en pesos los precios de proveedor que vienen
// en USD (ver lib/product-helpers.ts). Se consulta UNA VEZ POR DÍA, no en
// cada visita: refreshDolarOficialCache() la llama el scheduled() del
// custom-worker.ts (Cloudflare Cron Trigger), getDolarOficialVenta() solo
// LEE lo que quedó cacheado. Mismo Workers KV que cdo-api.ts/maya-api.ts
// (ver catalog-cache.ts), pero acá no hay stale-while-revalidate por
// request — el "revalidate" lo hace el cron, no el visitante.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCache, setCache } from "./catalog-cache";

const CACHE_KEY = "dolar-oficial-venta";
// Más que las 24h entre corridas del cron: así el valor nunca "vence" en
// medio de un día si el cron se atrasa un rato. No es un TTL de
// frescura real (eso lo decide el cron), es solo para que KV no lo borre.
const CACHE_TTL_MS = 26 * 60 * 60 * 1000;

async function fetchFromDolarApi(): Promise<number | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { venta?: unknown };
    const venta = Number(data.venta);
    return Number.isFinite(venta) && venta > 0 ? venta : null;
  } catch (err) {
    console.error("[dolar] Error consultando dolarapi.com:", err);
    return null;
  }
}

async function fetchFromBcra(): Promise<number | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const token = env.BCRA_API_TOKEN;
    if (!token) return null;

    const res = await fetch("https://api.estadisticasbcra.com/usd_of", {
      headers: { Authorization: `BEARER ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { v?: unknown }[];
    const last = data.at(-1);
    const venta = Number(last?.v);
    return Number.isFinite(venta) && venta > 0 ? venta : null;
  } catch (err) {
    console.error("[dolar] Error consultando api.estadisticasbcra.com:", err);
    return null;
  }
}

/** Dólar oficial (venta), primero dolarapi.com, si falla cae al BCRA. `null` si las dos fallan. */
export async function fetchDolarOficialVenta(): Promise<number | null> {
  const primary = await fetchFromDolarApi();
  if (primary != null) return primary;

  console.error("[dolar] dolarapi.com no respondió, probando fallback BCRA...");
  return fetchFromBcra();
}

/** La llama el cron (scheduled() de custom-worker.ts) — pega a las APIs y guarda el resultado. */
export async function refreshDolarOficialCache(): Promise<void> {
  const venta = await fetchDolarOficialVenta();
  if (venta == null) {
    console.error("[dolar] No se pudo actualizar el dólar oficial (las dos fuentes fallaron)");
    return;
  }
  await setCache(CACHE_KEY, venta, CACHE_TTL_MS);
}

/**
 * Lee el dólar oficial cacheado — no dispara un fetch en vivo (eso es
 * responsabilidad del cron). Solo si el cache está completamente vacío
 * (deploy nuevo, el cron todavía no corrió ni una vez) hace un fetch de
 * arranque, para que el sitio no se quede sin precio el primer día.
 */
export async function getDolarOficialVenta(): Promise<number | null> {
  const cached = await getCache<number>(CACHE_KEY);
  if (cached) return cached.data;

  const venta = await fetchDolarOficialVenta();
  if (venta != null) await setCache(CACHE_KEY, venta, CACHE_TTL_MS);
  return venta;
}
