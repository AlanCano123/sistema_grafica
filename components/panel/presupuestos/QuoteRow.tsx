"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { getQuoteClient, getQuoteItems, quoteNumber, type Quote } from "@/lib/quotes";
import { formatMoney } from "@/lib/documents";
import { downloadPdf } from "@/lib/pdf-download";
import { RemitoDocument } from "@/components/panel/documents/DocumentTemplates";
import NumberInput from "@/components/panel/NumberInput";
import { convertQuoteToOrderAction, deleteQuoteAction } from "@/app/panel/(dashboard)/presupuestos/actions";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

// El <form> de estado vive fuera de la tabla (ver PresupuestosPage) — <form>
// no puede envolver un <tr>. Los inputs de estado se asocian vía `form`.
// El mini-form "Convertir a pedido" sí es client-side (llama la action con
// un objeto, no FormData) y se muestra en una fila extra debajo.
export default function QuoteRow({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [converting, setConverting] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [jobName, setJobName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [hasDeposit, setHasDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const formId = `quote-${quote.id}`;

  async function handleRemito() {
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

  async function handleConvertToOrder() {
    if (!jobName.trim()) return;
    setCreatingOrder(true);
    try {
      await convertQuoteToOrderAction({
        quoteId: quote.id,
        job_name: jobName,
        due_date: dueDate || null,
        has_deposit: hasDeposit,
        deposit_amount: hasDeposit ? depositAmount ?? 0 : 0,
      });
      setShowConvert(false);
      router.refresh();
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <>
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
            {quote.order_id !== null ? (
              <Link
                href="/panel/pedidos"
                className="w-full rounded bg-gray-100 px-2 py-1 text-center text-xs font-semibold text-gray-600 hover:bg-gray-200"
              >
                Pedido #{quote.order_id}
              </Link>
            ) : quote.status === "aceptado" ? (
              <button
                type="button"
                onClick={() => setShowConvert((v) => !v)}
                className="w-full rounded bg-[#1cc88a] px-2 py-1 text-xs font-semibold text-white hover:bg-[#17a674]"
              >
                Convertir a pedido
              </button>
            ) : null}
            {quote.status === "aceptado" && (
              <button
                type="button"
                onClick={handleRemito}
                disabled={converting}
                className="flex w-full items-center justify-center gap-1 rounded bg-white px-2 py-1 text-xs font-semibold text-[#1cc88a] ring-1 ring-[#1cc88a]/40 hover:bg-[#1cc88a]/5 disabled:opacity-60"
              >
                <FileDown size={12} />
                {converting ? "Generando…" : "Remito PDF"}
              </button>
            )}
          </div>
        </td>
      </tr>

      {showConvert && quote.order_id === null && (
        <tr className="bg-[#1cc88a]/5">
          <td colSpan={6} className="px-3 py-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <label className="text-xs text-gray-500 md:col-span-2">
                Nombre del pedido / placa
                <input className={`mt-1 ${inputClass}`} value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Ej: Cartel corpóreo MDF" />
              </label>
              <label className="text-xs text-gray-500">
                Fecha a entregar
                <input className={`mt-1 ${inputClass}`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-xs text-gray-500">
                <input type="checkbox" checked={hasDeposit} onChange={(e) => setHasDeposit(e.target.checked)} className="h-4 w-4" />
                Deja seña
              </label>
              <label className="text-xs text-gray-500">
                Seña ($)
                <NumberInput
                  className={`mt-1 ${inputClass}`}
                  min="0"
                  step="any"
                  disabled={!hasDeposit}
                  value={depositAmount}
                  onValueChange={setDepositAmount}
                />
              </label>
            </div>
            <button
              type="button"
              disabled={creatingOrder || !jobName.trim()}
              onClick={handleConvertToOrder}
              className="mt-3 rounded bg-[#1cc88a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17a674] disabled:opacity-60"
            >
              {creatingOrder ? "Creando pedido…" : "Crear pedido"}
            </button>
          </td>
        </tr>
      )}
    </>
  );
}
