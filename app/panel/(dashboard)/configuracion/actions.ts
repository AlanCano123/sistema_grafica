"use server";

import { revalidatePath } from "next/cache";
import { createOperatingCost, deleteOperatingCost, updateOperatingCost, updatePricingSettings } from "@/lib/materials-db";

function num(formData: FormData, key: string): number {
  return parseFloat(String(formData.get(key) ?? "0"));
}

export async function createOperatingCostAction(formData: FormData) {
  const category = String(formData.get("category")) === "rrhh" ? "rrhh" : "operativo";
  await createOperatingCost({
    category,
    name: String(formData.get("name") ?? ""),
    amount: num(formData, "amount"),
  });
  revalidatePath("/panel/configuracion");
}

export async function updateOperatingCostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await updateOperatingCost(id, {
    name: String(formData.get("name") ?? ""),
    amount: num(formData, "amount"),
  });
  revalidatePath("/panel/configuracion");
}

export async function deleteOperatingCostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteOperatingCost(id);
  revalidatePath("/panel/configuracion");
}

export async function updateSettingsAction(formData: FormData) {
  await updatePricingSettings({
    working_days: num(formData, "working_days"),
    non_working_days: num(formData, "non_working_days"),
    daily_hours: num(formData, "daily_hours"),
    wholesale_margin_pct: num(formData, "wholesale_margin_pct"),
    retail_margin_pct: num(formData, "retail_margin_pct"),
    avg_mo_minutes_web: num(formData, "avg_mo_minutes_web"),
  });
  revalidatePath("/panel/configuracion");
  revalidatePath("/");
}
