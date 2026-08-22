// Cache en memoria de proceso — interino hasta cablear Workers KV.
// En Cloudflare Workers cada isolate puede
// reciclarse seguido, así que esto no persiste entre instancias frías;
// el stale-while-revalidate de cdo-api.ts/maya-api.ts igual sirve dentro
// de una misma instancia caliente.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function getCache<T>(key: string): Promise<CacheEntry<T> | null> {
  const entry = store.get(key);
  return (entry as CacheEntry<T> | undefined) ?? null;
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  store.set(key, { data: value, expiresAt: Date.now() + ttlMs });
}
