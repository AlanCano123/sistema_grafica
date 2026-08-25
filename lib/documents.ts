// Presupuesto/Remito en PDF — datos fijos del negocio + tipos del
// formulario. No se persiste nada en D1 a propósito (confirmado con
// Fernando): se completa el formulario y se descarga, sin historial.

export const BUSINESS_INFO = {
  razonSocial: "Laser Kind",
  cuit: "20-23942954-9",
  web: "",
  direccion: "Zapiola 231",
  localidad: "Rio Gallegos - Santa Cruz",
  telefono: "2966226605",
};

export interface ClientInfo {
  nombre: string;
  domicilio: string;
  localidad: string;
  cuit: string;
  telefono: string;
  cp: string;
  provincia: string;
  otrosDatos: string;
}

export const EMPTY_CLIENT: ClientInfo = {
  nombre: "",
  domicilio: "",
  localidad: "",
  cuit: "",
  telefono: "",
  cp: "",
  provincia: "",
  otrosDatos: "",
};

export interface DocumentItem {
  description: string;
  quantity: number;
  unitPrice: number; // solo lo usa el presupuesto; el remito lo ignora
}

export const EMPTY_ITEM: DocumentItem = { description: "", quantity: 1, unitPrice: 0 };

export function itemSubtotal(item: DocumentItem): number {
  return item.quantity * item.unitPrice;
}

export function itemsTotal(items: DocumentItem[]): number {
  return items.reduce((sum, i) => sum + itemSubtotal(i), 0);
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(value);
}

export function todayDDMMYYYY(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
