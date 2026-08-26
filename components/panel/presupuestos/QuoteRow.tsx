"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { getQuoteClient, getQuoteItems, quoteNumber, type Quote } from "@/lib/quotes";
import { formatMoney } from "@/lib/documents";
import { downloadPdf } from "@/lib/pdf-download";
import { RemitoDocument } from "@/components/panel/documents/DocumentTemplates";
import { deleteQuoteAction } from "@/app/panel/(dashboard)/presupuestos/actions";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

// Nota HTML: el <form> real de esta fila vive fuera de la tabla (ver
// PresupuestosPage) — <form> no puede envolver un <tr> ni ser hijo de
// <tbody>, es HTML inválido y el browser lo descarta al parsear. Los
// inputs/botones de acá se asocian vía el atributo `form`, mismo patrón
// que Materiales/Pedidos/Ventas/Movimientos.
export default function QuoteRow({ quote }: { quote: Quote }) {
  const [converting, setConverting] = useState(false);
  const formId = `quote-${quote.id}`;

  async function handleConvert() {
    setConverting(true);
    try {
      const number = quoteNumber(quote);
      await downloadPdf(
        <RemitoDocument client={getQuoteClient(quote)} items={getQuoteItems(quote)} number={number} />,
        `remito-${number}.pdf`
      );
    } finally {
      setConverting(false);
    }
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2 font-medium text-gray-800">{quoteNumber(quote)}</td>
      <td className="px-3 py-2 text-gray-500">{new Date(quote.created_at).toLocaleDateString("es-AR")}</td>
      <td className="px-3 py-2 text-gray-800">{quote.client_nombre}</td>
      <td className="px-3 py-2 text-right font-bold text-gray-800">{formatMoney(quote.total)}</td>
      <td className="px-3 py-2">
        <input type="hidden" form={formId} name="id" value={quote.id} />
        <select form={formId} name="status" defaultValue={quote.status} className={inputClass}>
          <option value="pendiente">Pendiente</option>
          <option value="aceptado">Aceptado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <button form={formId} type="submit" className="w-full rounded bg-[#4e73df] px-2 py-1 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
            Guardar
          </button>
          <button
            form={formId}
            type="submit"
            formAction={deleteQuoteAction}
            className="w-full rounded bg-[#e74a3b] px-2 py-1 text-xs font-semibold text-white hover:bg-[#c8392c]"
          >
            Borrar
          </button>
          {quote.status === "aceptado" && (
            <button
              type="button"
              onClick={handleConvert}
              disabled={converting}
              className="flex w-full items-center justify-center gap-1 rounded bg-[#1cc88a] px-2 py-1 text-xs font-semibold text-white hover:bg-[#17a674] disabled:opacity-60"
            >
              <FileDown size={12} />
              {converting ? "Generando…" : "Convertir a remito"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
