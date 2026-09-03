"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/panel-auth";
import { updateSiteSettings } from "@/lib/materials-db";
import { countServicePhotos, createServicePhoto, deleteServicePhoto, moveServicePhoto } from "@/lib/service-photos";
import {
  MAX_PHOTOS_PER_PRODUCT,
  countOwnProductPhotos,
  createOwnProduct,
  createOwnProductPhoto,
  deleteOwnProduct,
  deleteOwnProductPhoto,
  moveOwnProductPhoto,
  updateOwnProduct,
  type OwnProductInput,
} from "@/lib/own-products";
import { setGrabadosPricing } from "@/lib/site-content";
import { MAX_PHOTOS_PER_SERVICE, SERVICE_SLUGS } from "@/lib/services";
import { requiredNumber } from "@/lib/validate";

const ALLOWED_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);
const MAX_BYTES = 3 * 1024 * 1024;

function revalidateAll() {
  revalidatePath("/panel/sitio");
  revalidatePath("/");
  revalidatePath("/catalogo");
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAuth();
  await updateSiteSettings({
    avg_mo_minutes_web: requiredNumber(formData, "avg_mo_minutes_web", { min: 0, max: 1000 }),
    catalog_multiplier: requiredNumber(formData, "catalog_multiplier", { min: 0.1, max: 100 }),
  });
  revalidateAll();
}

const GRABADO_TIERS = 4;

export async function updateGrabadosPricingAction(formData: FormData) {
  await requireAuth();
  const items = [];
  for (let i = 0; i < GRABADO_TIERS; i++) {
    const label = String(formData.get(`label_${i}`) ?? "").trim().slice(0, 60);
    const price = String(formData.get(`price_${i}`) ?? "").trim().slice(0, 30);
    if (label) items.push({ label, price });
  }
  await setGrabadosPricing(items);
  revalidatePath("/panel/sitio");
  revalidatePath("/");
}

export async function uploadServicePhotosAction(formData: FormData) {
  await requireAuth();
  const slug = String(formData.get("slug") ?? "");
  if (!SERVICE_SLUGS.includes(slug)) return;

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  let count = await countServicePhotos(slug);

  for (const file of files) {
    if (count >= MAX_PHOTOS_PER_SERVICE) break;
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) continue;
    const bytes = await file.arrayBuffer();
    const id = await createServicePhoto(slug, bytes, file.type);
    if (id !== null) count++;
  }
  revalidatePath("/panel/sitio");
  revalidatePath("/");
}

export async function deleteServicePhotoAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteServicePhoto(id);
  revalidatePath("/panel/sitio");
  revalidatePath("/");
}

export async function moveServicePhotoAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  const dir = String(formData.get("dir")) === "up" ? "up" : "down";
  await moveServicePhoto(id, dir);
  revalidatePath("/panel/sitio");
  revalidatePath("/");
}

// --- Productos propios -----------------------------------------------

function ownProductInput(formData: FormData): OwnProductInput {
  const str = (k: string, max = 200) => String(formData.get(k) ?? "").trim().slice(0, max);
  const num = (k: string) => {
    const n = Number(formData.get(k));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const name = str("name", 150);
  return {
    name,
    description: str("description", 500) || null,
    price: Math.min(num("price"), 1_000_000_000),
    category: str("category", 80) || null,
    stock: Math.min(Math.round(num("stock")), 1_000_000),
    code: str("code", 40) || null,
    active: formData.get("active") ? 1 : 0,
  };
}

export async function createOwnProductAction(formData: FormData) {
  await requireAuth();
  const data = ownProductInput(formData);
  if (!data.name) return;
  await createOwnProduct(data);
  revalidateAll();
}

export async function updateOwnProductAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  const data = ownProductInput(formData);
  if (!data.name) return;
  await updateOwnProduct(id, data);
  revalidateAll();
}

export async function deleteOwnProductAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteOwnProduct(id);
  revalidateAll();
}

export async function uploadOwnProductPhotosAction(formData: FormData) {
  await requireAuth();
  const productId = Number(formData.get("product_id"));
  if (!Number.isInteger(productId) || productId < 1) return;

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  let count = await countOwnProductPhotos(productId);
  for (const file of files) {
    if (count >= MAX_PHOTOS_PER_PRODUCT) break;
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) continue;
    const bytes = await file.arrayBuffer();
    const id = await createOwnProductPhoto(productId, bytes, file.type);
    if (id !== null) count++;
  }
  revalidateAll();
}

export async function deleteOwnProductPhotoAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteOwnProductPhoto(id);
  revalidateAll();
}

export async function moveOwnProductPhotoAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  const dir = String(formData.get("dir")) === "up" ? "up" : "down";
  await moveOwnProductPhoto(id, dir);
  revalidateAll();
}
