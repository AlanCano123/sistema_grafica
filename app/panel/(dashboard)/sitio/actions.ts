"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/panel-auth";
import { updateSiteSettings } from "@/lib/materials-db";
import { countServicePhotos, createServicePhoto, deleteServicePhoto, moveServicePhoto } from "@/lib/service-photos";
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
  await requireAdmin();
  await updateSiteSettings({
    avg_mo_minutes_web: requiredNumber(formData, "avg_mo_minutes_web", { min: 0, max: 1000 }),
    catalog_multiplier: requiredNumber(formData, "catalog_multiplier", { min: 0.1, max: 100 }),
  });
  revalidateAll();
}

export async function uploadServicePhotosAction(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteServicePhoto(id);
  revalidatePath("/panel/sitio");
  revalidatePath("/");
}

export async function moveServicePhotoAction(formData: FormData) {
  await requireAdmin();
  const id = requiredNumber(formData, "id", { min: 1 });
  const dir = String(formData.get("dir")) === "up" ? "up" : "down";
  await moveServicePhoto(id, dir);
  revalidatePath("/panel/sitio");
  revalidatePath("/");
}
