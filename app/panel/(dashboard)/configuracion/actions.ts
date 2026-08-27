"use server";

import { revalidatePath } from "next/cache";
import { createOperatingCost, deleteOperatingCost, updateOperatingCost, updatePricingSettings } from "@/lib/materials-db";
import { requireAdmin } from "@/lib/panel-auth";
import { requiredNumber, requiredString } from "@/lib/validate";

export async function createOperatingCostAction(formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category")) === "rrhh" ? "rrhh" : "operativo";
  await createOperatingCost({
    category,
    name: requiredString(formData, "name", { max: 100 }),
    amount: requiredNumber(formData, "amount", { min: 0, max: 1_000_000_000 }),
  });
  revalidatePath("/panel/configuracion");
}

export async function updateOperatingCostAction(formData: FormData) {
  await requireAdmin();
  const id = requiredNumber(formData, "id", { min: 1 });
  await updateOperatingCost(id, {
    name: requiredString(formData, "name", { max: 100 }),
    amount: requiredNumber(formData, "amount", { min: 0, max: 1_000_000_000 }),
  });
  revalidatePath("/panel/configuracion");
}

export async function deleteOperatingCostAction(formData: FormData) {
  await requireAdmin();
  const id = requiredNumber(formData, "id", { min: 1 });
  await deleteOperatingCost(id);
  revalidatePath("/panel/configuracion");
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  await updatePricingSettings({
    working_days: requiredNumber(formData, "working_days", { min: 0, max: 366 }),
    non_working_days: requiredNumber(formData, "non_working_days", { min: 0, max: 366 }),
    daily_hours: requiredNumber(formData, "daily_hours", { min: 0, max: 24 }),
    wholesale_margin_pct: requiredNumber(formData, "wholesale_margin_pct", { min: 0, max: 1000 }),
    retail_margin_pct: requiredNumber(formData, "retail_margin_pct", { min: 0, max: 1000 }),
    avg_mo_minutes_web: requiredNumber(formData, "avg_mo_minutes_web", { min: 0, max: 1000 }),
  });
  revalidatePath("/panel/configuracion");
  revalidatePath("/");
}
