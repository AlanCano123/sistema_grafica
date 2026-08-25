import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/** Genera el PDF en el navegador (nunca en el Worker) y dispara la
 * descarga. Compartido entre el generador de Cotizador y "Convertir a
 * remito" en Presupuestos — solo se llama desde Client Components. */
export async function downloadPdf(element: ReactElement<DocumentProps>, filename: string) {
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
