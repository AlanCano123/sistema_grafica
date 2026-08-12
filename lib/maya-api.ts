import { getCache, setCache } from "./catalog-cache";
import { Picture, Product, Variant } from "./types";
import { MayaArticle, MayaLoginResponse, MayaPhoto } from "./maya-types";

const CACHE_KEY = "maya-products";

// Estas variables viven en .env.local y NUNCA se exponen al navegador
// porque este archivo solo se importa desde Server Components / route handlers.
const MAYA_BASE_URL = process.env.MAYA_API_BASE_URL;
const MAYA_EMAIL = process.env.MAYA_API_EMAIL;
const MAYA_PASSWORD = process.env.MAYA_API_PASSWORD;

// A diferencia de CDO, Maya es un proveedor "opcional": si faltan credenciales
// o la API falla, el catálogo sigue funcionando solo con CDO en vez de romper
// toda la página (por eso acá NO se hace throw como en cdo-api.ts).
const MAYA_ENABLED = Boolean(MAYA_BASE_URL && MAYA_EMAIL && MAYA_PASSWORD);

// Prefijo para que los ids de Maya (que son strings tipo "1", "42") nunca
// choquen con los ids numéricos de CDO al combinar ambos catálogos.
const MAYA_PREFIX = "maya-";

// --- Login y cache de token en memoria ------------------------------------
// El login (usuario/contraseña) devuelve un JWT de corta duración
// (expires_in, típicamente 3600s) y no hay endpoint de refresh, así que
// hay que volver a loguear cuando expira. Se cachea en una variable de
// módulo: vive mientras el proceso del server esté "caliente".

let cachedToken: { token: string; expiresAt: number } | null = null;
// Single-flight: si varios pedidos concurrentes necesitan loguear al mismo
// tiempo (token vencido o server recién arrancado), que compartan el mismo
// login en vez de mandar N logins simultáneos.
let inflightLogin: Promise<string> | null = null;

async function mayaLogin(): Promise<string> {
  const res = await fetch(`${MAYA_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: MAYA_EMAIL, password: MAYA_PASSWORD }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Login de Maya falló (status ${res.status})`);
  }

  const data = (await res.json()) as MayaLoginResponse;
  cachedToken = {
    token: data.access_token,
    // Margen de seguridad de 30s para no usar un token que expira justo
    // en medio de un pedido.
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };
  return cachedToken.token;
}

async function getMayaToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  if (!inflightLogin) {
    inflightLogin = mayaLogin().finally(() => {
      inflightLogin = null;
    });
  }
  return inflightLogin;
}

/** Fetch autenticado contra la API de Maya; reintenta una vez si el token quedó inválido (401). */
async function mayaFetch(path: string, retryOn401 = true): Promise<Response> {
  const token = await getMayaToken();
  const res = await fetch(`${MAYA_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    // Manejamos el cache de productos nosotros mismos (más abajo) porque
    // el header Authorization cambia con cada login y no queremos que el
    // fetch cache de Next se confunda con eso.
    cache: "no-store",
  });

  if (res.status === 401 && retryOn401) {
    cachedToken = null;
    return mayaFetch(path, false);
  }

  return res;
}

// --- Adaptación al modelo de Product unificado -----------------------------

function pickPicture(photos: MayaPhoto[] | undefined, fallback: MayaPhoto[] | undefined): Picture {
  const photo = photos?.find((p) => p.primary) ?? photos?.[0] ?? fallback?.find((p) => p.primary) ?? fallback?.[0];
  return {
    small: photo?.url_thumb ?? photo?.url_normal ?? "",
    medium: photo?.url_normal ?? photo?.url_large ?? "",
    original: photo?.url_large ?? photo?.url_normal ?? "",
  };
}

function mayaToProduct(article: MayaArticle): Product {
  const variants: Variant[] = article.variants.map((v) => {
    const picture = pickPicture(v.photos, article.photos);
    return {
      id: `${MAYA_PREFIX}${v.id}`,
      sku: v.code || v.id,
      novedad: false,
      stock_available: v.stock?.quantity ?? 0,
      stock_existent: v.stock?.quantity ?? 0,
      list_price: v.price,
      net_price: v.price,
      picture,
      detail_picture: picture,
      other_pictures: [],
      color: v.color
        ? {
            id: `${MAYA_PREFIX}${v.color.id}`,
            name: v.color.name,
            hex_code: v.color.hex_code || "#000000",
            picture: v.color.url_picture_color || "",
          }
        : undefined,
    };
  });

  return {
    id: `${MAYA_PREFIX}${article.id}`,
    code: article.code || article.id,
    name: article.name,
    description: article.description ?? "",
    categories: article.category
      ? [{ id: `${MAYA_PREFIX}${article.category.id}`, name: article.category.name }]
      : [],
    variants,
    provider: "maya",
  };
}

// --- Cache de productos ------------------------------------------------
// En Supabase (catalog-cache.ts), no en memoria: mismo motivo que
// cdo-api.ts — en Vercel cada instancia serverless es un proceso
// aparte, la memoria no se comparte entre ellas. El token de login
// (cachedToken, arriba) sí se deja en memoria: relogear es barato,
// no vale la pena persistirlo.

async function fetchMayaProductsFromApi(): Promise<Product[]> {
  const res = await mayaFetch("/api/v1/article/without-print");
  if (!res.ok) {
    throw new Error(`API de Maya respondió status ${res.status}`);
  }
  const articles = (await res.json()) as MayaArticle[];
  return articles.map(mayaToProduct);
}

let isRefreshing = false;
let inflightFetch: Promise<Product[]> | null = null;
// 1h, mismo criterio que cdo-api.ts: con SWR el TTL no afecta velocidad
// percibida, solo cuán seguido se pega contra la API. Alineado además con
// el ciclo de vida del token (expires_in 3600s), así el refresh de
// productos coincide más o menos con el relogin.
const PRODUCTS_TTL_MS = 60 * 60 * 1000;

/**
 * Trae todo el catálogo de Maya ya convertido al modelo Product unificado.
 * Nunca tira: si falta config o la API falla, loguea el error y devuelve
 * [] (o lo último cacheado) para que el catálogo combinado siga mostrando
 * lo que sí funciona. Usa stale-while-revalidate igual que cdo-api.ts:
 * login + traer ~300 artículos tarda unos segundos, así que si el cache
 * venció se sirve la versión vieja al toque y se refresca atrás.
 */
export async function getMayaProducts(): Promise<Product[]> {
  if (!MAYA_ENABLED) return [];

  const cached = await getCache<Product[]>(CACHE_KEY);

  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.data;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      fetchMayaProductsFromApi()
        .then((data) => setCache(CACHE_KEY, data, PRODUCTS_TTL_MS))
        .catch((err) => console.error("[maya-api] Error refrescando catálogo:", err))
        .finally(() => {
          isRefreshing = false;
        });
    }

    return cached.data;
  }

  try {
    if (!inflightFetch) {
      inflightFetch = fetchMayaProductsFromApi().finally(() => {
        inflightFetch = null;
      });
    }
    const products = await inflightFetch;
    await setCache(CACHE_KEY, products, PRODUCTS_TTL_MS);
    return products;
  } catch (err) {
    console.error("[maya-api] No se pudieron traer productos de Maya:", err);
    return [];
  }
}
