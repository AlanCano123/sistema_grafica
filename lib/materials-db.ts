// Acceso a D1 para materiales, gastos/sueldos y configuración de precios.
// Separado de lib/materials.ts (tipos + fórmula pura) a propósito: este
// archivo importa getCloudflareContext, que solo puede vivir en server
// code — si se mezclara con lib/materials.ts, cualquier Client Component
// que lo importe (PriceCalculator, Cotizador) arrastraría ese import al
// bundle del navegador. Mismo patrón que lib/business.ts.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { DEFAULT_SETTINGS, type Material, type OperatingCost, type PricingSettings } from "./materials";

// --- Materiales -------------------------------------------------------

export async function getMaterials(): Promise<Material[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { results } = await env.DB.prepare("SELECT * FROM materials ORDER BY name ASC").all<Material>();
    return results;
  } catch (err) {
    console.error("[materials-db] Error trayendo materiales:", err);
    return [];
  }
}

export type MaterialInput = Omit<Material, "id" | "created_at">;

export async function createMaterial(data: MaterialInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "INSERT INTO materials (name, thickness_mm, sheet_width_mm, sheet_length_mm, sheet_cost) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(data.name, data.thickness_mm, data.sheet_width_mm, data.sheet_length_mm, data.sheet_cost)
    .run();
}

export async function updateMaterial(id: number, data: MaterialInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "UPDATE materials SET name = ?, thickness_mm = ?, sheet_width_mm = ?, sheet_length_mm = ?, sheet_cost = ? WHERE id = ?"
  )
    .bind(data.name, data.thickness_mm, data.sheet_width_mm, data.sheet_length_mm, data.sheet_cost, id)
    .run();
}

export async function deleteMaterial(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM materials WHERE id = ?").bind(id).run();
}

// --- Gastos operativos + Recursos Humanos ------------------------------

export async function getOperatingCosts(): Promise<OperatingCost[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { results } = await env.DB.prepare(
      "SELECT * FROM operating_costs ORDER BY category ASC, name ASC"
    ).all<OperatingCost>();
    return results;
  } catch (err) {
    console.error("[materials-db] Error trayendo gastos/sueldos:", err);
    return [];
  }
}

export type OperatingCostInput = { category: "operativo" | "rrhh"; name: string; amount: number };

export async function createOperatingCost(data: OperatingCostInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("INSERT INTO operating_costs (category, name, amount) VALUES (?, ?, ?)")
    .bind(data.category, data.name, data.amount)
    .run();
}

export async function updateOperatingCost(id: number, data: { name: string; amount: number }): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("UPDATE operating_costs SET name = ?, amount = ? WHERE id = ?")
    .bind(data.name, data.amount, id)
    .run();
}

export async function deleteOperatingCost(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM operating_costs WHERE id = ?").bind(id).run();
}

// --- Configuración global (fila única) ---------------------------------

export async function getPricingSettings(): Promise<PricingSettings> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const row = await env.DB.prepare("SELECT * FROM pricing_settings WHERE id = 1").first<PricingSettings>();
    return row ?? DEFAULT_SETTINGS;
  } catch (err) {
    console.error("[materials-db] Error trayendo configuración de precios:", err);
    return DEFAULT_SETTINGS;
  }
}

// Configuración de costos/márgenes internos (pantalla Configuración, bajo
// Finanzas). `avg_mo_minutes_web` y `catalog_multiplier` son del sitio
// público — se editan en /panel/sitio con updateSiteSettings().
export async function updatePricingSettings(
  data: Omit<PricingSettings, "id" | "avg_mo_minutes_web" | "catalog_multiplier">
): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "UPDATE pricing_settings SET working_days = ?, non_working_days = ?, daily_hours = ?, wholesale_margin_pct = ?, retail_margin_pct = ? WHERE id = 1"
  )
    .bind(
      data.working_days,
      data.non_working_days,
      data.daily_hours,
      data.wholesale_margin_pct,
      data.retail_margin_pct
    )
    .run();
}

/** Settings del sitio público: minutos MO promedio de la calculadora y
 * multiplicador de precios del catálogo. */
export async function updateSiteSettings(data: {
  avg_mo_minutes_web: number;
  catalog_multiplier: number;
}): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "UPDATE pricing_settings SET avg_mo_minutes_web = ?, catalog_multiplier = ? WHERE id = 1"
  )
    .bind(data.avg_mo_minutes_web, data.catalog_multiplier)
    .run();
}
