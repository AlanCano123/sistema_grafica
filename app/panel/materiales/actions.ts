"use server";

import { revalidatePath } from "next/cache";
import { createMaterial, deleteMaterial, updateMaterial } from "@/lib/materials-db";

function num(formData: FormData, key: string): number {
  return parseFloat(String(formData.get(key) ?? "0"));
}

export async function createMaterialAction(formData: FormData) {
  await createMaterial({
    name: String(formData.get("name") ?? ""),
    thickness_mm: num(formData, "thickness_mm"),
    sheet_width_mm: num(formData, "sheet_width_mm"),
    sheet_length_mm: num(formData, "sheet_length_mm"),
    sheet_cost: num(formData, "sheet_cost"),
  });
  revalidatePath("/panel/materiales");
}

export async function updateMaterialAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await updateMaterial(id, {
    name: String(formData.get("name") ?? ""),
    thickness_mm: num(formData, "thickness_mm"),
    sheet_width_mm: num(formData, "sheet_width_mm"),
    sheet_length_mm: num(formData, "sheet_length_mm"),
    sheet_cost: num(formData, "sheet_cost"),
  });
  revalidatePath("/panel/materiales");
}

export async function deleteMaterialAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteMaterial(id);
  revalidatePath("/panel/materiales");
}
