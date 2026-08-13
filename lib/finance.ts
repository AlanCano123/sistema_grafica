// Datos ficticios — sin persistencia en DB, solo para mostrar el front.

export const SALES_BY_PERIOD = {
  daily: 45000,
  weekly: 280000,
  monthly: 1150000,
};

export const AVG_TICKET = 38500;

export interface ServiceTypeSales {
  type: string;
  amount: number;
  pct: number;
}

export const SALES_BY_TYPE: ServiceTypeSales[] = [
  { type: "Corte láser", amount: 480000, pct: 42 },
  { type: "Grabado láser", amount: 320000, pct: 28 },
  { type: "Productos terminados en stock", amount: 230000, pct: 20 },
  { type: "Diseño personalizado", amount: 120000, pct: 10 },
];

export interface MaterialDemand {
  material: string;
  pct: number;
}

export const MATERIAL_DEMAND: MaterialDemand[] = [
  { material: "Acrílico", pct: 60 },
  { material: "MDF", pct: 30 },
  { material: "Grabado en madera", pct: 10 },
];

export interface ProjectMargin {
  id: string;
  project: string;
  machineTimeCost: number;
  materialCost: number;
  laborCost: number;
  pricedAt: number;
}

export const PROJECT_MARGINS: ProjectMargin[] = [
  { id: "PM-1", project: "Cartel corpóreo MDF - Estudio Levy", machineTimeCost: 8500, materialCost: 22000, laborCost: 12000, pricedAt: 65000 },
  { id: "PM-2", project: "500 llaveros acrílico - Kiosco Don Mario", machineTimeCost: 15000, materialCost: 18000, laborCost: 9000, pricedAt: 58000 },
  { id: "PM-3", project: "Placa institucional dorada - Estudio Jurídico", machineTimeCost: 4200, materialCost: 9500, laborCost: 6000, pricedAt: 28000 },
  { id: "PM-4", project: "Maqueta arquitectónica - Arq. Roldán", machineTimeCost: 21000, materialCost: 34000, laborCost: 25000, pricedAt: 95000 },
  { id: "PM-5", project: "100 souvenirs cuero - Agencia Cronos", machineTimeCost: 11000, materialCost: 26000, laborCost: 8000, pricedAt: 52000 },
];

export function getProjectMargin(p: ProjectMargin): { cost: number; profit: number; marginPct: number } {
  const cost = p.machineTimeCost + p.materialCost + p.laborCost;
  const profit = p.pricedAt - cost;
  const marginPct = p.pricedAt > 0 ? Math.round((profit / p.pricedAt) * 100) : 0;
  return { cost, profit, marginPct };
}

export interface PendingQuote {
  id: string;
  client: string;
  amount: number;
  sentDate: string;
  status: "pendiente" | "aprobado" | "rechazado";
}

export const PENDING_QUOTES: PendingQuote[] = [
  { id: "COT-201", client: "Constructora Alvear", amount: 340000, sentDate: "2026-08-09", status: "pendiente" },
  { id: "COT-202", client: "Estudio de diseño Nube", amount: 58000, sentDate: "2026-08-11", status: "pendiente" },
  { id: "COT-203", client: "Vivero El Ombú", amount: 21000, sentDate: "2026-08-11", status: "pendiente" },
  { id: "COT-204", client: "Hotel Boutique Sur", amount: 190000, sentDate: "2026-08-06", status: "aprobado" },
  { id: "COT-205", client: "Consultora RH Plus", amount: 45000, sentDate: "2026-08-05", status: "rechazado" },
];

export interface PendingBalance {
  id: string;
  client: string;
  total: number;
  paid: number;
}

export const PENDING_BALANCES: PendingBalance[] = [
  { id: "SAL-301", client: "Estudio Arq. Levy", total: 65000, paid: 32500 },
  { id: "SAL-302", client: "Arq. Fabiana Roldán", total: 95000, paid: 47500 },
  { id: "SAL-303", client: "Agencia Publicidad Cronos", total: 52000, paid: 20000 },
];
