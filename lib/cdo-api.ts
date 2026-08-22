import { getCache, setCache } from "./catalog-cache";
import { Product, ProductsResponse } from "./types";

const CACHE_KEY = "cdo-products";

// Estas variables viven en .env.local y NUNCA se exponen al navegador
// porque este archivo solo se importa desde Server Components / route handlers.
const API_BASE_URL = process.env.CDO_API_BASE_URL;
const API_TOKEN = process.env.CDO_API_TOKEN;

if (!API_BASE_URL || !API_TOKEN) {
  // Falla rápido y claro en vez de arrastrar un error confuso más adelante.
  throw new Error(
    "Faltan las variables de entorno CDO_API_BASE_URL / CDO_API_TOKEN. Revisá tu archivo .env.local"
  );
}

interface GetProductsParams {
  page?: number;
  pageSize?: number;
}

/**
 * Trae productos paginados desde la API de CDO Promocionales.
 * Se ejecuta siempre en el servidor (Server Component), así el token
 * nunca viaja al navegador del cliente.
 */
export async function getProducts({
  page = 1,
  pageSize = 24,
}: GetProductsParams = {}): Promise<ProductsResponse> {
  const url = new URL(API_BASE_URL as string);
  url.searchParams.set("auth_token", API_TOKEN as string);
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("page_number", String(page));

  // No usamos el fetch cache de Next acá: alguna página de 100 productos
  // pesa más de 2MB y Next tira "items over 2MB can not be cached" (no
  // rompe, pero ensucia los logs en cada pedido). El cacheo real lo hace
  // getAllProducts() en memoria, más abajo.
  const res = await fetch(url.toString(), { cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `Error al consultar la API de CDO (status ${res.status}): ${res.statusText}`
    );
  }

  return res.json() as Promise<ProductsResponse>;
}

// La API de CDO es lenta en serio: una sola página de 100 productos puede
// tardar 30+ segundos en responder (medido). Traer las 4 páginas del
// catálogo una por una (secuencial) significa 2 minutos de espera. Por eso:
//  1) las páginas se piden todas en paralelo (Promise.all), no en loop.
//  2) el resultado se cachea en memoria con stale-while-revalidate: si el
//     cache venció, se devuelve la versión vieja al toque y se refresca
//     en segundo plano, para que el usuario nunca pague esa espera salvo
//     en el primerísimo pedido que recibe el server.
const MAX_PAGE_SIZE = 100;

async function fetchAllProductsFromApi(): Promise<Product[]> {
  const first = await getProducts({ page: 1, pageSize: MAX_PAGE_SIZE });
  const totalPages = first.meta.pagination.total_pages;

  const rest = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
      getProducts({ page: i + 2, pageSize: MAX_PAGE_SIZE })
    )
  );

  return [...first.products, ...rest.flatMap((r) => r.products)];
}

/**
 * Trae TODOS los productos del catálogo. La API no soporta filtrar por
 * categoría del lado del servidor (ignora parámetros desconocidos), así
 * que traemos todo y filtramos acá.
 *
 * El cache lo maneja catalog-cache.ts (memoria por ahora, Workers KV
 * después). En serverless/edge cada instancia puede ser un proceso
 * distinto y no comparte memoria entre sí, así que esto no persiste
 * entre cold starts — es interino.
 * `isRefreshing`/`inflightFetch` siguen siendo en memoria acá — son solo un
 * best-effort para no duplicar trabajo DENTRO de una misma instancia
 * caliente; entre instancias distintas puede haber algún refresh
 * duplicado ocasional, no pasa nada, es barato comparado con no cachear.
 */
let isRefreshing = false;
let inflightFetch: Promise<Product[]> | null = null;
// 1h: con stale-while-revalidate el usuario nunca espera este tiempo (se
// sirve el cache viejo al toque mientras refresca atrás), así que subir
// el TTL solo baja cuán seguido pegamos contra la API lenta de CDO — no
// afecta velocidad percibida. El costo es stock/precio desactualizado
// hasta 1h en el peor caso.
const PRODUCTS_TTL_MS = 60 * 60 * 1000;

export async function getAllProducts(): Promise<Product[]> {
  const cached = await getCache<Product[]>(CACHE_KEY);

  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      fetchAllProductsFromApi()
        .then((data) => setCache(CACHE_KEY, data, PRODUCTS_TTL_MS))
        .catch((err) => console.error("[cdo-api] Error refrescando catálogo:", err))
        .finally(() => {
          isRefreshing = false;
        });
    }

    return cached.data; // servimos lo último conocido mientras refresca
  }

  // Primer pedido desde que arrancó el server (o cache vacío todavía):
  // no hay nada que mostrar, hay que esperar sí o sí (pero solo una vez
  // por instancia, ver comentario arriba).
  if (!inflightFetch) {
    inflightFetch = fetchAllProductsFromApi().finally(() => {
      inflightFetch = null;
    });
  }

  const data = await inflightFetch;
  await setCache(CACHE_KEY, data, PRODUCTS_TTL_MS);
  return data;
}
