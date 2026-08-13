// Datos ficticios — sin persistencia en DB, solo para mostrar el front.

export type ClientType = "recurrente" | "esporadico";

export interface ClientStat {
  id: string;
  name: string;
  segment: string; // diseñador, arquitecto, agencia, comercio, particular...
  type: ClientType;
  orders: number;
}

export const CLIENTS: ClientStat[] = [
  { id: "c1", name: "Estudio Arq. Levy", segment: "Arquitectura", type: "recurrente", orders: 14 },
  { id: "c2", name: "Kiosco Don Mario", segment: "Comercio", type: "recurrente", orders: 11 },
  { id: "c3", name: "Estudio Jurídico Pérez & Asoc.", segment: "Servicios profesionales", type: "recurrente", orders: 9 },
  { id: "c4", name: "Farmacia Central", segment: "Comercio", type: "recurrente", orders: 8 },
  { id: "c5", name: "Agencia Publicidad Cronos", segment: "Agencia", type: "recurrente", orders: 7 },
  { id: "c6", name: "Estudio de diseño Nube", segment: "Diseño", type: "recurrente", orders: 6 },
  { id: "c7", name: "Panadería La Espiga", segment: "Comercio", type: "recurrente", orders: 5 },
  { id: "c8", name: "Gimnasio Fuerza Total", segment: "Comercio", type: "recurrente", orders: 5 },
  { id: "c9", name: "Arq. Fabiana Roldán", segment: "Arquitectura", type: "esporadico", orders: 2 },
  { id: "c10", name: "Constructora Alvear", segment: "Construcción", type: "esporadico", orders: 1 },
  { id: "c11", name: "Vivero El Ombú", segment: "Comercio", type: "esporadico", orders: 1 },
  { id: "c12", name: "Hotel Boutique Sur", segment: "Hotelería", type: "esporadico", orders: 1 },
  { id: "c13", name: "Consultora RH Plus", segment: "Servicios profesionales", type: "esporadico", orders: 1 },
  { id: "c14", name: "Café Martínez (local Palermo)", segment: "Gastronomía", type: "esporadico", orders: 1 },
];

export function getClientTypeCounts(): { recurrente: number; esporadico: number } {
  return {
    recurrente: CLIENTS.filter((c) => c.type === "recurrente").length,
    esporadico: CLIENTS.filter((c) => c.type === "esporadico").length,
  };
}

// De cada 10 cotizaciones enviadas, cuántas se convierten en venta.
export const QUOTE_CONVERSION = { sent: 42, converted: 27 };

export const AVG_RESPONSE_TIME_HOURS = 3.5;
