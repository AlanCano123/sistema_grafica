// Tarifas de ejemplo (por cm²) — VALORES PROVISORIOS, ajustar con precios
// reales del negocio. Calcadas de MATERIAL_RATES en el diseño original
// (front-end/js/main.js).
export interface Material {
  id: string;
  label: string;
  rate: number; // ARS por cm²
  base: number; // ARS base
}

export const MATERIALS: Material[] = [
  { id: "mdf", label: "MDF", rate: 3.5, base: 1500 },
  { id: "acrilico", label: "Acrílico", rate: 6, base: 2000 },
  { id: "madera", label: "Madera", rate: 4.5, base: 1800 },
  { id: "metal", label: "Metal", rate: 9, base: 3000 },
  { id: "cuero", label: "Cuero", rate: 5, base: 1500 },
  { id: "vidrio", label: "Vidrio", rate: 7, base: 2000 },
];

/** Precio estimado = base + área(cm²) × tarifa, redondeado a la decena. */
export function calculatePrice(largoCm: number, anchoCm: number, materialId: string): number | null {
  const material = MATERIALS.find((m) => m.id === materialId);
  if (!material || !largoCm || !anchoCm || largoCm <= 0 || anchoCm <= 0) return null;

  const area = largoCm * anchoCm;
  const precio = material.base + area * material.rate;
  return Math.round(precio / 10) * 10;
}
