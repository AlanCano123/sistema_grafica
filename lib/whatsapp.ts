// Número real de Láser Kind: 2966 22-6605 (Río Gallegos, Santa Cruz).
export const WHATSAPP_NUMBER = "5492966226605";
const DEFAULT_MESSAGE = "Hola! Quiero pedir un presupuesto en Láser Kind.";

export function buildWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(message ?? DEFAULT_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
