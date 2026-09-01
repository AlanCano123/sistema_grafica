// Tipos de servicio de un item del pedido — para "Ventas por tipo de
// servicio" en Finanzas. Lista fija, confirmada con Fernando. Sin acceso a
// D1 acá, así lo puede importar el item builder del Cotizador (client).
export const SERVICE_TYPES: { value: string; label: string }[] = [
  { value: "corte_laser", label: "Corte láser" },
  { value: "grabado_laser", label: "Grabado láser" },
  { value: "impresion_uv", label: "Impresión UV" },
  { value: "impresion_dtf", label: "Impresión DTF" },
  { value: "impresion_textil", label: "Impresión textil" },
  { value: "corte_polifan", label: "Corte de Polifan" },
  { value: "carteleria_corporea", label: "Cartelería Corpórea" },
  { value: "diseno_personalizado", label: "Diseño Personalizado" },
];

export function serviceTypeLabel(value: string | null): string {
  if (!value || value === "sin_especificar") return "Sin especificar";
  return SERVICE_TYPES.find((t) => t.value === value)?.label ?? value;
}
