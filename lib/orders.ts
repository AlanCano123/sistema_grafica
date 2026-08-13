// Datos ficticios — sin persistencia en DB, solo para mostrar el front.

export type OrderStatus = "pendiente" | "produccion" | "terminado";

export interface Order {
  id: string;
  client: string;
  description: string;
  status: OrderStatus;
  dueDate: string; // ISO date
  deliveredOnTime: boolean | null; // null = todavía no se entregó
}

export const ORDERS: Order[] = [
  { id: "P-1042", client: "Estudio Arq. Levy", description: "Cartel corpóreo MDF 10mm", status: "pendiente", dueDate: "2026-08-16", deliveredOnTime: null },
  { id: "P-1043", client: "Kiosco Don Mario", description: "500 llaveros acrílico grabado", status: "pendiente", dueDate: "2026-08-14", deliveredOnTime: null },
  { id: "P-1044", client: "Panadería La Espiga", description: "Cartelería vidriera vinilo + MDF", status: "pendiente", dueDate: "2026-08-15", deliveredOnTime: null },
  { id: "P-1038", client: "Estudio Jurídico Pérez", description: "Placa institucional acrílico dorado", status: "produccion", dueDate: "2026-08-13", deliveredOnTime: null },
  { id: "P-1039", client: "Gimnasio Fuerza Total", description: "20 medallas grabadas madera", status: "produccion", dueDate: "2026-08-13", deliveredOnTime: null },
  { id: "P-1040", client: "Farmacia Central", description: "Set displays acrílico transparente", status: "produccion", dueDate: "2026-08-14", deliveredOnTime: null },
  { id: "P-1041", client: "Estudio de diseño Nube", description: "Prototipo packaging triplay 3mm", status: "produccion", dueDate: "2026-08-12", deliveredOnTime: null },
  { id: "P-1030", client: "Café Martínez (local Palermo)", description: "Menú acrílico + soporte MDF", status: "terminado", dueDate: "2026-08-10", deliveredOnTime: true },
  { id: "P-1031", client: "Agencia Publicidad Cronos", description: "100 souvenirs corte láser cuero", status: "terminado", dueDate: "2026-08-09", deliveredOnTime: true },
  { id: "P-1032", client: "Arq. Fabiana Roldán", description: "Maqueta arquitectónica MDF chapado", status: "terminado", dueDate: "2026-08-08", deliveredOnTime: false },
  { id: "P-1033", client: "Gimnasio Fuerza Total", description: "Cartel led + acrílico", status: "terminado", dueDate: "2026-08-07", deliveredOnTime: true },
  { id: "P-1034", client: "Kiosco Don Mario", description: "Exhibidor de mostrador MDF", status: "terminado", dueDate: "2026-08-06", deliveredOnTime: true },
  { id: "P-1035", client: "Estudio Jurídico Pérez", description: "Portarretratos grabados x10", status: "terminado", dueDate: "2026-08-05", deliveredOnTime: false },
  { id: "P-1036", client: "Panadería La Espiga", description: "Cartel vidriera acrílico", status: "terminado", dueDate: "2026-08-04", deliveredOnTime: true },
  { id: "P-1037", client: "Farmacia Central", description: "Señalética interna x8", status: "terminado", dueDate: "2026-08-03", deliveredOnTime: true },
];

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return ORDERS.filter((o) => o.status === status);
}

export function getOnTimeStats(): { onTime: number; late: number; pct: number } {
  const delivered = ORDERS.filter((o) => o.deliveredOnTime !== null);
  const onTime = delivered.filter((o) => o.deliveredOnTime).length;
  const late = delivered.length - onTime;
  const pct = delivered.length > 0 ? Math.round((onTime / delivered.length) * 100) : 0;
  return { onTime, late, pct };
}
