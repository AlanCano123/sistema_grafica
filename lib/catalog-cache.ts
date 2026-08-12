import { supabase } from "./supabase";

// Cache compartido en Supabase (tabla catalog_cache) para que el catálogo
// sobreviva entre instancias serverless de Vercel — el cache en memoria
// de antes se perdía en cada cold start / instancia distinta.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export async function getCache<T>(key: string): Promise<CacheEntry<T> | null> {
  const { data, error } = await supabase
    .from("catalog_cache")
    .select("data, expires_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error(`[catalog-cache] Error leyendo "${key}":`, error);
    return null;
  }
  if (!data) return null;

  return {
    data: data.data as T,
    expiresAt: new Date(data.expires_at).getTime(),
  };
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  const { error } = await supabase
    .from("catalog_cache")
    .upsert({ key, data: value, expires_at: expiresAt, updated_at: now.toISOString() });

  if (error) {
    console.error(`[catalog-cache] Error escribiendo "${key}":`, error);
  }
}
