// Datos ficticios para el prototipo — no son precios reales todavía.
export interface Material {
  id: string;
  name: string;
  pricePerM2: number; // ARS por m²
  minCharge: number; // costo mínimo del trabajo, aunque el área sea chica
}

export const MATERIALS: Material[] = [
  { id: "vinilo", name: "Vinilo Adhesivo", pricePerM2: 1500, minCharge: 800 },
  { id: "lona", name: "Lona Banner", pricePerM2: 1200, minCharge: 700 },
  { id: "acrilico", name: "Acrílico 3mm", pricePerM2: 3800, minCharge: 2000 },
  { id: "mdf", name: "MDF 3mm", pricePerM2: 2900, minCharge: 1500 },
  { id: "chapa", name: "Chapa Metálica", pricePerM2: 4500, minCharge: 2500 },
  { id: "telgopor", name: "Telgopor 5mm", pricePerM2: 900, minCharge: 500 },
];
