// Datos ficticios — sin persistencia en DB, solo para mostrar el front.
// (Distinto de lib/materials.ts, que son los precios que usa la calculadora.)

export interface MaterialStock {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minThreshold: number;
}

export const MATERIALS_STOCK: MaterialStock[] = [
  { id: "mdf-3", name: "MDF 3mm", unit: "láminas", stock: 42, minThreshold: 15 },
  { id: "mdf-6", name: "MDF 6mm", unit: "láminas", stock: 8, minThreshold: 10 },
  { id: "mdf-chapado", name: "MDF Chapado Roble", unit: "láminas", stock: 5, minThreshold: 6 },
  { id: "acrilico-transparente-3", name: "Acrílico Transparente 3mm", unit: "láminas", stock: 27, minThreshold: 12 },
  { id: "acrilico-transparente-5", name: "Acrílico Transparente 5mm", unit: "láminas", stock: 14, minThreshold: 10 },
  { id: "acrilico-color", name: "Acrílico de Colores (varios)", unit: "láminas", stock: 9, minThreshold: 15 },
  { id: "cuero", name: "Cuero sintético", unit: "m²", stock: 18, minThreshold: 8 },
  { id: "triplay-3", name: "Triplay 3mm", unit: "láminas", stock: 3, minThreshold: 8 },
  { id: "triplay-6", name: "Triplay 6mm", unit: "láminas", stock: 11, minThreshold: 6 },
];

export interface AuxSupply {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minThreshold: number;
}

export const AUX_SUPPLIES: AuxSupply[] = [
  { id: "pintura-spray-negra", name: "Pintura spray negra mate", unit: "unidades", stock: 6, minThreshold: 5 },
  { id: "pegamento-contacto", name: "Pegamento de contacto", unit: "litros", stock: 2, minThreshold: 3 },
  { id: "masking-tape", name: "Cinta masking tape", unit: "rollos", stock: 14, minThreshold: 6 },
  { id: "packaging", name: "Cajas de packaging", unit: "unidades", stock: 60, minThreshold: 40 },
  { id: "tornilleria", name: "Tornillería / accesorios varios", unit: "kits", stock: 22, minThreshold: 10 },
];

export function getLowStockAlerts(): (MaterialStock | AuxSupply)[] {
  return [...MATERIALS_STOCK, ...AUX_SUPPLIES].filter((m) => m.stock < m.minThreshold);
}

export interface WasteReason {
  reason: string;
  pct: number;
}

// % de material desperdiciado este mes (ficticio) y su desglose.
export const WASTE_PCT = 8.4;

export const WASTE_BREAKDOWN: WasteReason[] = [
  { reason: "Fallas de corte", pct: 45 },
  { reason: "Pruebas de calibración", pct: 30 },
  { reason: "Mal anidado / maquetación", pct: 25 },
];
