// Número real de Láser Kind: 2966 21-5330 (Río Gallegos, Santa Cruz).
export const WHATSAPP_NUMBER = "5492966215330";
const DEFAULT_MESSAGE = "Hola! Quiero pedir un presupuesto en Láser Kind.";

export function buildWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(message ?? DEFAULT_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
