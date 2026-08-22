import { getCloudflareContext } from "@opennextjs/cloudflare";

// Cache compartido en Workers KV — sobrevive entre instancias/isolates,
// a diferencia de una variable de módulo en memoria.
//
// Ojo con el TTL: el "expiresAt" que guardamos en el JSON es la
// vigencia LÓGICA que usan cdo-api.ts/maya-api.ts para su
// stale-while-revalidate (sirven el dato vencido al toque mientras
// refrescan atrás). El TTL FÍSICO de KV (expirationTtl) tiene que ser
// bastante más largo que eso — si coincidieran, KV borraría la entrada
// justo cuando todavía la queremos servir "stale".
const PHYSICAL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días, colchón de seguridad

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export async function getCache<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const entry = await env.KV.get<CacheEntry<T>>(key, "json");
    return entry;
  } catch (err) {
    console.error(`[catalog-cache] Error leyendo "${key}":`, err);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const entry: CacheEntry<T> = { data: value, expiresAt: Date.now() + ttlMs };
    await env.KV.put(key, JSON.stringify(entry), { expirationTtl: PHYSICAL_TTL_SECONDS });
  } catch (err) {
    console.error(`[catalog-cache] Error escribiendo "${key}":`, err);
  }
}
