import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Product } from "./types";

// Productos propios (tabla own_products) + sus fotos (KV
// `ownproduct:<productId>:<photoId>`, metadata en own_product_photos).
// Se administran en /panel/sitio y se mezclan en el catálogo público con
// provider "propio" (ver lib/catalog.ts). Mismo patrón que las fotos de
// servicios (lib/service-photos.ts).

export interface OwnProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock: number;
  code: string | null;
  active: 0 | 1;
  sort_order: number;
  created_at: string;
}

export interface OwnProductPhoto {
  id: number;
  product_id: number;
  content_type: string;
  sort_order: number;
  created_at: string;
}

export type OwnProductInput = {
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock: number;
  code: string | null;
  active: 0 | 1;
};

export const MAX_PHOTOS_PER_PRODUCT = 6;

export function ownPhotoKvKey(productId: number, photoId: number): string {
  return `ownproduct:${productId}:${photoId}`;
}

export function ownPhotoUrl(productId: number, photoId: number): string {
  return `/fotos-productos/${productId}/${photoId}`;
}

/** Código visible del producto: el que cargó Fernando, o "P<id>" neutro. */
export function ownProductCode(p: OwnProduct): string {
  return p.code && p.code.trim() !== "" ? p.code.trim() : `P${p.id}`;
}

function categorySlug(name: string): string {
  return (
    "lkcat-" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

// --- Productos --------------------------------------------------------

export async function getOwnProducts(includeInactive = false): Promise<OwnProduct[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const sql = includeInactive
      ? "SELECT * FROM own_products ORDER BY sort_order, id"
      : "SELECT * FROM own_products WHERE active = 1 ORDER BY sort_order, id";
    const { results } = await env.DB.prepare(sql).all<OwnProduct>();
    return results;
  } catch (err) {
    console.error("[own-products] Error trayendo productos propios:", err);
    return [];
  }
}

export async function getOwnProductById(id: number): Promise<OwnProduct | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT * FROM own_products WHERE id = ?").bind(id).first<OwnProduct>();
    return row ?? null;
  } catch {
    return null;
  }
}

export async function createOwnProduct(data: OwnProductInput): Promise<number> {
  const { env } = await getCloudflareContext({ async: true });
  const maxRow = await env.DB.prepare("SELECT MAX(sort_order) AS m FROM own_products").first<{ m: number | null }>();
  const res = await env.DB.prepare(
    `INSERT INTO own_products (name, description, price, category, stock, code, active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      data.name,
      data.description,
      data.price,
      data.category,
      data.stock,
      data.code,
      data.active,
      (maxRow?.m ?? -1) + 1
    )
    .run();
  return res.meta.last_row_id;
}

export async function updateOwnProduct(id: number, data: OwnProductInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    `UPDATE own_products SET name = ?, description = ?, price = ?, category = ?, stock = ?, code = ?, active = ?
     WHERE id = ?`
  )
    .bind(data.name, data.description, data.price, data.category, data.stock, data.code, data.active, id)
    .run();
}

export async function deleteOwnProduct(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const photos = await getOwnProductPhotos(id);
  for (const ph of photos) {
    await env.KV.delete(ownPhotoKvKey(id, ph.id));
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM own_product_photos WHERE product_id = ?").bind(id),
    env.DB.prepare("DELETE FROM own_products WHERE id = ?").bind(id),
  ]);
}

// --- Fotos -----------------------------------------------------------

export async function getOwnProductPhotos(productId?: number): Promise<OwnProductPhoto[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const stmt = productId
      ? env.DB.prepare("SELECT * FROM own_product_photos WHERE product_id = ? ORDER BY sort_order, id").bind(productId)
      : env.DB.prepare("SELECT * FROM own_product_photos ORDER BY product_id, sort_order, id");
    const { results } = await stmt.all<OwnProductPhoto>();
    return results;
  } catch (err) {
    console.error("[own-products] Error trayendo fotos:", err);
    return [];
  }
}

export async function getOwnPhotosByProduct(): Promise<Map<number, OwnProductPhoto[]>> {
  const all = await getOwnProductPhotos();
  const map = new Map<number, OwnProductPhoto[]>();
  for (const p of all) {
    const list = map.get(p.product_id) ?? [];
    list.push(p);
    map.set(p.product_id, list);
  }
  return map;
}

export async function countOwnProductPhotos(productId: number): Promise<number> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM own_product_photos WHERE product_id = ?")
      .bind(productId)
      .first<{ c: number }>();
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

export async function createOwnProductPhoto(
  productId: number,
  bytes: ArrayBuffer,
  contentType: string
): Promise<number | null> {
  const { env } = await getCloudflareContext({ async: true });
  const maxRow = await env.DB.prepare("SELECT MAX(sort_order) AS m FROM own_product_photos WHERE product_id = ?")
    .bind(productId)
    .first<{ m: number | null }>();
  const res = await env.DB.prepare(
    "INSERT INTO own_product_photos (product_id, content_type, sort_order) VALUES (?, ?, ?)"
  )
    .bind(productId, contentType, (maxRow?.m ?? -1) + 1)
    .run();
  const id = res.meta.last_row_id;
  try {
    await env.KV.put(ownPhotoKvKey(productId, id), bytes, { metadata: { contentType } });
  } catch (err) {
    console.error("[own-products] KV.put falló, revierto:", err);
    await env.DB.prepare("DELETE FROM own_product_photos WHERE id = ?").bind(id).run();
    return null;
  }
  return id;
}

export async function deleteOwnProductPhoto(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const row = await env.DB.prepare("SELECT id, product_id FROM own_product_photos WHERE id = ?")
    .bind(id)
    .first<{ id: number; product_id: number }>();
  if (!row) return;
  await env.KV.delete(ownPhotoKvKey(row.product_id, row.id));
  await env.DB.prepare("DELETE FROM own_product_photos WHERE id = ?").bind(id).run();
}

export async function moveOwnProductPhoto(id: number, dir: "up" | "down"): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const row = await env.DB.prepare("SELECT id, product_id, sort_order FROM own_product_photos WHERE id = ?")
    .bind(id)
    .first<{ id: number; product_id: number; sort_order: number }>();
  if (!row) return;
  const op = dir === "up" ? "<" : ">";
  const ord = dir === "up" ? "DESC" : "ASC";
  const neighbor = await env.DB.prepare(
    `SELECT id, sort_order FROM own_product_photos
     WHERE product_id = ? AND sort_order ${op} ? ORDER BY sort_order ${ord} LIMIT 1`
  )
    .bind(row.product_id, row.sort_order)
    .first<{ id: number; sort_order: number }>();
  if (!neighbor) return;
  await env.DB.batch([
    env.DB.prepare("UPDATE own_product_photos SET sort_order = ? WHERE id = ?").bind(neighbor.sort_order, row.id),
    env.DB.prepare("UPDATE own_product_photos SET sort_order = ? WHERE id = ?").bind(row.sort_order, neighbor.id),
  ]);
}

// --- Adaptador al catálogo público ----------------------------------

function toProduct(p: OwnProduct, photos: OwnProductPhoto[]): Product {
  const urls = photos.map((ph) => ownPhotoUrl(p.id, ph.id));
  const main = urls[0] ?? "/placeholder.svg";
  const pic = { small: main, medium: main, original: main };
  const code = ownProductCode(p);
  return {
    id: `lk-${p.id}`,
    code,
    name: p.name,
    description: p.description ?? "",
    categories: p.category ? [{ id: categorySlug(p.category), name: p.category }] : [],
    variants: [
      {
        id: `lk-${p.id}-v`,
        sku: code,
        novedad: false,
        stock_available: p.stock,
        stock_existent: p.stock,
        list_price: String(p.price),
        net_price: String(p.price),
        picture: pic,
        detail_picture: pic,
        other_pictures: urls.slice(1).map((u, i) => ({ index: i, small: u, medium: u, original: u })),
      },
    ],
    provider: "propio",
  };
}

/** Productos propios activos con sus fotos, en la forma `Product` del catálogo. */
export async function getOwnProductsAsProducts(): Promise<Product[]> {
  const [products, photosByProduct] = await Promise.all([getOwnProducts(false), getOwnPhotosByProduct()]);
  return products.map((p) => toProduct(p, photosByProduct.get(p.id) ?? []));
}
