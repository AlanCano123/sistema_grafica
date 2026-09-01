import { getCloudflareContext } from "@opennextjs/cloudflare";

// Fotos del carrusel de servicios del sitio público. Metadata + orden en
// D1 (tabla `service_photos`), bytes en KV con clave
// `sitephoto:<service_slug>:<id>`. Ver migración 0012 y /panel/sitio.

export interface ServicePhoto {
  id: number;
  service_slug: string;
  content_type: string;
  sort_order: number;
  created_at: string;
}

export function photoKvKey(slug: string, id: number): string {
  return `sitephoto:${slug}:${id}`;
}

/** URL pública (same-origin) para mostrar la foto. */
export function photoUrl(slug: string, id: number): string {
  return `/fotos/${slug}/${id}`;
}

export async function getServicePhotos(): Promise<ServicePhoto[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { results } = await env.DB.prepare(
      "SELECT * FROM service_photos ORDER BY service_slug, sort_order, id"
    ).all<ServicePhoto>();
    return results;
  } catch (err) {
    console.error("[service-photos] Error trayendo fotos:", err);
    return [];
  }
}

/** `Map<slug, ServicePhoto[]>` para pasar a la sección de servicios del sitio. */
export async function getServicePhotosBySlug(): Promise<Map<string, ServicePhoto[]>> {
  const all = await getServicePhotos();
  const map = new Map<string, ServicePhoto[]>();
  for (const p of all) {
    const list = map.get(p.service_slug) ?? [];
    list.push(p);
    map.set(p.service_slug, list);
  }
  return map;
}

export async function countServicePhotos(slug: string): Promise<number> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM service_photos WHERE service_slug = ?")
      .bind(slug)
      .first<{ c: number }>();
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

/** Inserta la fila y sube los bytes a KV. Devuelve el id, o null si falló. */
export async function createServicePhoto(
  slug: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<number | null> {
  const { env } = await getCloudflareContext({ async: true });
  const maxRow = await env.DB.prepare("SELECT MAX(sort_order) AS m FROM service_photos WHERE service_slug = ?")
    .bind(slug)
    .first<{ m: number | null }>();
  const nextOrder = (maxRow?.m ?? -1) + 1;

  const res = await env.DB.prepare(
    "INSERT INTO service_photos (service_slug, content_type, sort_order) VALUES (?, ?, ?)"
  )
    .bind(slug, contentType, nextOrder)
    .run();
  const id = res.meta.last_row_id;

  try {
    await env.KV.put(photoKvKey(slug, id), bytes, { metadata: { contentType } });
  } catch (err) {
    console.error("[service-photos] KV.put falló, revierto la fila:", err);
    await env.DB.prepare("DELETE FROM service_photos WHERE id = ?").bind(id).run();
    return null;
  }
  return id;
}

export async function deleteServicePhoto(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const row = await env.DB.prepare("SELECT id, service_slug FROM service_photos WHERE id = ?")
    .bind(id)
    .first<{ id: number; service_slug: string }>();
  if (!row) return;
  await env.KV.delete(photoKvKey(row.service_slug, row.id));
  await env.DB.prepare("DELETE FROM service_photos WHERE id = ?").bind(id).run();
}

/** Mueve una foto una posición arriba/abajo dentro de su servicio. */
export async function moveServicePhoto(id: number, dir: "up" | "down"): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  const row = await env.DB.prepare("SELECT id, service_slug, sort_order FROM service_photos WHERE id = ?")
    .bind(id)
    .first<{ id: number; service_slug: string; sort_order: number }>();
  if (!row) return;

  const op = dir === "up" ? "<" : ">";
  const ord = dir === "up" ? "DESC" : "ASC";
  const neighbor = await env.DB.prepare(
    `SELECT id, sort_order FROM service_photos
     WHERE service_slug = ? AND sort_order ${op} ?
     ORDER BY sort_order ${ord} LIMIT 1`
  )
    .bind(row.service_slug, row.sort_order)
    .first<{ id: number; sort_order: number }>();
  if (!neighbor) return;

  await env.DB.batch([
    env.DB.prepare("UPDATE service_photos SET sort_order = ? WHERE id = ?").bind(neighbor.sort_order, row.id),
    env.DB.prepare("UPDATE service_photos SET sort_order = ? WHERE id = ?").bind(row.sort_order, neighbor.id),
  ]);
}
