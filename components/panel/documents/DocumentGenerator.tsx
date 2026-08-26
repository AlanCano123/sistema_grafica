"use client";

import { useState } from "react";
import { FileDown, Plus, Trash2 } from "lucide-react";
import { EMPTY_CLIENT, EMPTY_ITEM, itemsTotal, type ClientInfo, type DocumentItem } from "@/lib/documents";
import { downloadPdf } from "@/lib/pdf-download";
import { PresupuestoDocument } from "./DocumentTemplates";
import { createQuoteAction } from "@/app/panel/(dashboard)/cotizador/actions";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

export default function DocumentGenerator() {
  const [client, setClient] = useState<ClientInfo>(EMPTY_CLIENT);
  const [items, setItems] = useState<DocumentItem[]>([{ ...EMPTY_ITEM }]);
  const [generating, setGenerating] = useState(false);

  function updateClient<K extends keyof ClientInfo>(key: K, value: ClientInfo[K]) {
    setClient((c) => ({ ...c, [key]: value }));
  }

  function updateItem<K extends keyof DocumentItem>(index: number, key: K, value: DocumentItem[K]) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addItem() {
    setItems((rows) => [...rows, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }

  async function handleDownload() {
    setGenerating(true);
    try {
      const cleanItems = items.filter((i) => i.description.trim() !== "");
      // El presupuesto se guarda solo (para poder convertirlo a remito
      // después si el cliente acepta, ver /panel/presupuestos) — el número
      // real del documento es PRES-{id}, derivado del id guardado.
      const id = await createQuoteAction({ client, items: cleanItems, total: itemsTotal(cleanItems) });
      const quoteNum = `PRES-${id}`;
      await downloadPdf(<PresupuestoDocument client={client} items={cleanItems} number={quoteNum} />, `presupuesto-${quoteNum}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-sm font-bold text-[#4e73df]">Presupuesto</h2>
      <p className="mb-4 text-xs text-gray-400">
        Completá los datos del cliente y los artículos, y descargá el PDF — queda guardado en{" "}
        <a href="/panel/presupuestos" className="text-[#4e73df] hover:underline">
          Presupuestos
        </a>{" "}
        para convertirlo a remito cuando el cliente acepte (mismo cliente y artículos, sin cargar nada de nuevo).
      </p>

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <label className="text-xs text-gray-500">
          Nombre del cliente
          <input className={`mt-1 ${inputClass}`} value={client.nombre} onChange={(e) => updateClient("nombre", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          CUIT
          <input className={`mt-1 ${inputClass}`} value={client.cuit} onChange={(e) => updateClient("cuit", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          Teléfono
          <input className={`mt-1 ${inputClass}`} value={client.telefono} onChange={(e) => updateClient("telefono", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          Domicilio
          <input className={`mt-1 ${inputClass}`} value={client.domicilio} onChange={(e) => updateClient("domicilio", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          Localidad
          <input className={`mt-1 ${inputClass}`} value={client.localidad} onChange={(e) => updateClient("localidad", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          C.P.
          <input className={`mt-1 ${inputClass}`} value={client.cp} onChange={(e) => updateClient("cp", e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">
          Provincia
          <input className={`mt-1 ${inputClass}`} value={client.provincia} onChange={(e) => updateClient("provincia", e.target.value)} />
        </label>
        <label className="col-span-2 text-xs text-gray-500 md:col-span-4">
          Otros datos
          <input className={`mt-1 ${inputClass}`} value={client.otrosDatos} onChange={(e) => updateClient("otrosDatos", e.target.value)} />
        </label>
      </div>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-2 py-2">Descripción</th>
              <th className="px-2 py-2 w-24">Cantidad</th>
              <th className="px-2 py-2 w-32">Precio unit. ($)</th>
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-2 py-1.5">
                  <input
                    className={inputClass}
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Ej: Medallas en MDF con bicapa"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value) || 0)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value) || 0)}
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-[#e74a3b]" title="Sacar fila">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#4e73df] hover:underline"
        >
          <Plus size={14} /> Agregar artículo
        </button>
      </div>

      <button
        type="button"
        disabled={generating}
        onClick={handleDownload}
        className="flex items-center gap-2 rounded bg-[#1cc88a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17a674] disabled:opacity-60"
      >
        <FileDown size={16} />
        {generating ? "Generando…" : "Descargar Presupuesto (PDF)"}
      </button>
    </div>
  );
}
