// Tipos y fórmula pura de precios — sin acceso a D1 acá a propósito, así
// este archivo se puede importar tanto desde Server Components como desde
// Client Components (ej. PriceCalculator.tsx, components/panel/Cotizador.tsx)
// sin arrastrar getCloudflareContext al bundle del navegador.
// El acceso a la base (CRUD) vive en lib/materials-db.ts.
//
// Fórmula calcada de "Planilla de Costos de Produccion 2026.xlsx" (hojas
// "Materia Prima" + "Gastos Operativos - Sueldos" + "Lista de Precio
// editable"), verificada con ejemplos reales de Fernando.

export interface Material {
  id: number;
  name: string;
  thickness_mm: number;
  sheet_width_mm: number;
  sheet_length_mm: number;
  sheet_cost: number; // costo $ de la placa completa
  created_at: string;
}

export interface OperatingCost {
  id: number;
  category: "operativo" | "rrhh";
  name: string;
  amount: number;
  created_at: string;
}

export interface PricingSettings {
  id: number;
  working_days: number;
  non_working_days: number; // informativo, no afecta el cálculo (igual que el Excel)
  daily_hours: number;
  wholesale_margin_pct: number;
  retail_margin_pct: number;
  avg_mo_minutes_web: number; // minutos de MO promedio usados en la calculadora pública
}

export const DEFAULT_SETTINGS: PricingSettings = {
  id: 1,
  working_days: 26,
  non_working_days: 4,
  daily_hours: 8,
  wholesale_margin_pct: 50,
  retail_margin_pct: 100,
  avg_mo_minutes_web: 2.5,
};

/** Costo por mm² de un material: no se guarda en DB, se deriva siempre del
 * costo de placa actual (así nunca queda desactualizado). */
export function materialRatePerMm2(material: Material): number {
  const area = material.sheet_width_mm * material.sheet_length_mm;
  return area > 0 ? material.sheet_cost / area : 0;
}

export interface MoRates {
  operatingTotal: number;
  payrollTotal: number;
  monthlyHours: number;
  moPerHour: number;
  moPerMinute: number;
}

/** Valor de mano de obra x hora/minuto = (gastos operativos + sueldos) /
 * horas mensuales trabajadas. Misma fórmula que la hoja "Gastos Operativos
 * - Sueldos" del Excel. */
export function computeMoRates(settings: PricingSettings, costs: OperatingCost[]): MoRates {
  const operatingTotal = costs.filter((c) => c.category === "operativo").reduce((sum, c) => sum + c.amount, 0);
  const payrollTotal = costs.filter((c) => c.category === "rrhh").reduce((sum, c) => sum + c.amount, 0);
  const monthlyHours = settings.daily_hours * settings.working_days;
  const moPerHour = monthlyHours > 0 ? (operatingTotal + payrollTotal) / monthlyHours : 0;
  const moPerMinute = moPerHour / 60;
  return { operatingTotal, payrollTotal, monthlyHours, moPerHour, moPerMinute };
}

export interface PriceBreakdown {
  materialCost: number;
  laborCost: number;
  finalCost: number;
  wholesaleMargin: number;
  wholesalePrice: number;
  retailMargin: number;
  retailPrice: number;
}

/** Fórmula exacta de "Lista de Precio editable": costo_material = ancho ×
 * largo (mm) × costo_por_mm²; costo_mo = minutos × valor_mo_minuto;
 * costo_final = suma de ambos; precio = costo_final + costo_final×margen%. */
export function calculatePrice(
  widthMm: number,
  lengthMm: number,
  moMinutes: number,
  material: Material | undefined,
  moPerMinute: number,
  wholesalePct: number,
  retailPct: number
): PriceBreakdown | null {
  if (!material || !widthMm || !lengthMm || widthMm <= 0 || lengthMm <= 0 || moMinutes < 0) return null;

  const materialCost = widthMm * lengthMm * materialRatePerMm2(material);
  const laborCost = moMinutes * moPerMinute;
  const finalCost = materialCost + laborCost;
  const wholesaleMargin = finalCost * (wholesalePct / 100);
  const wholesalePrice = finalCost + wholesaleMargin;
  const retailMargin = finalCost * (retailPct / 100);
  const retailPrice = finalCost + retailMargin;

  return { materialCost, laborCost, finalCost, wholesaleMargin, wholesalePrice, retailMargin, retailPrice };
}
