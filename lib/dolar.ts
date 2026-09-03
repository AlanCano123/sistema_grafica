// Dólar oficial para estimar en pesos los precios de proveedor que vienen
// en USD (ver lib/product-helpers.ts). Se consulta UNA VEZ POR DÍA, no en
// cada visita: refreshDolarOficialCache() la llama el scheduled() del
// custom-worker.ts (Cloudflare Cron Trigger), getDolarOficialVenta() solo
// LEE lo que quedó cacheado. Mismo Workers KV que cdo-api.ts/maya-api.ts
// (ver catalog-cache.ts), pero acá no hay stale-while-revalidate por
// request — el "revalidate" lo hace el cron, no el visitante.
//
// 3 fuentes en cadena (se prueba en orden, la primera que responde gana):
//   1. dolarapi.com — minorista/venta (Banco Nación), rápido y estándar.
//   2. api.bcra.gob.ar (Estadísticas Cambiarias v1.0) — OFICIAL, sin
//      token, sin vencimiento. Da el tipo de referencia/mayorista (~1-2%
//      abajo del minorista) — aceptable para un "precio estimado".
//   3. api.estadisticasbcra.com — tercero, con token (JWT en
//      BCRA_API_TOKEN, vence ~agosto 2027; cuando muera devuelve null y
//      la cadena sigue). Otra IP/host: red de seguridad si Cloudflare
//      tiene bloqueada la IP del BCRA oficial.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCache, setCache } from "./catalog-cache";

const CACHE_KEY = "dolar-oficial-venta";
// Vigencia lógica (informativa). El TTL FÍSICO de KV lo fija catalog-cache
// (7 días) y el cron re-guarda el último valor conocido si todas las
// fuentes fallan, así el valor no vence mientras el cron siga corriendo.
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

async function fetchFromBcraOficial(): Promise<number | null> {
  try {
    const res = await fetch("https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones/USD", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { detalle?: { codigoMoneda?: string; tipoCotizacion?: unknown }[] }[];
    };
    const usd = data.results?.[0]?.detalle?.find((d) => d.codigoMoneda === "USD");
    const cot = Number(usd?.tipoCotizacion);
    return Number.isFinite(cot) && cot > 0 ? cot : null;
  } catch (err) {
    console.error("[dolar] Error consultando api.bcra.gob.ar (oficial):", err);
    return null;
  }
}

async function fetchFromEstadisticasBcra(): Promise<number | null> {
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

/** Dólar oficial (~venta) probando las 3 fuentes en orden. `null` si todas fallan. */
export async function fetchDolarOficialVenta(): Promise<number | null> {
  const sources: [string, () => Promise<number | null>][] = [
    ["dolarapi.com", fetchFromDolarApi],
    ["api.bcra.gob.ar (oficial)", fetchFromBcraOficial],
    ["api.estadisticasbcra.com", fetchFromEstadisticasBcra],
  ];

  for (const [name, fn] of sources) {
    const value = await fn();
    if (value != null) {
      console.log(`[dolar] Cotización de ${name}: ${value}`);
      return value;
    }
    console.error(`[dolar] ${name} no respondió, probando siguiente fuente…`);
  }
  return null;
}

/** La llama el cron (scheduled() de custom-worker.ts) — pega a las APIs y guarda el resultado. */
export async function refreshDolarOficialCache(): Promise<void> {
  const fresh = await fetchDolarOficialVenta();
  if (fresh != null) {
    await setCache(CACHE_KEY, fresh, CACHE_TTL_MS);
    return;
  }

  // Todas las fuentes fallaron: re-guardo el último valor conocido para
  // resetear el TTL físico de KV — un dólar viejo es infinitamente mejor
  // que el catálogo entero sin precios.
  const cached = await getCache<number>(CACHE_KEY);
  if (cached) {
    await setCache(CACHE_KEY, cached.data, CACHE_TTL_MS);
    console.error(`[dolar] Las 3 fuentes fallaron — mantengo el último valor conocido: ${cached.data}`);
  } else {
    console.error("[dolar] Las 3 fuentes fallaron y no hay valor cacheado previo");
  }
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
