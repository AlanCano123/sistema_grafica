"use server";

import { revalidatePath } from "next/cache";
import { createMaterial, deleteMaterial, updateMaterial } from "@/lib/materials-db";
import { requireAuth } from "@/lib/panel-auth";
import { requiredNumber, requiredString } from "@/lib/validate";

function materialInput(formData: FormData) {
  return {
    name: requiredString(formData, "name", { max: 100 }),
    thickness_mm: requiredNumber(formData, "thickness_mm", { min: 0.01, max: 1000 }),
    sheet_width_mm: requiredNumber(formData, "sheet_width_mm", { min: 0.01, max: 100_000 }),
    sheet_length_mm: requiredNumber(formData, "sheet_length_mm", { min: 0.01, max: 100_000 }),
    sheet_cost: requiredNumber(formData, "sheet_cost", { min: 0, max: 1_000_000_000 }),
  };
}

export async function createMaterialAction(formData: FormData) {
  await requireAuth();
  await createMaterial(materialInput(formData));
  revalidatePath("/panel/materiales");
}

export async function updateMaterialAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await updateMaterial(id, materialInput(formData));
  revalidatePath("/panel/materiales");
}

export async function deleteMaterialAction(formData: FormData) {
  await requireAuth();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteMaterial(id);
  revalidatePath("/panel/materiales");
}
