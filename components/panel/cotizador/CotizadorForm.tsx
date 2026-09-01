"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileDown, Plus, Trash2 } from "lucide-react";
import type { Material } from "@/lib/materials";
import { EMPTY_JOB_ITEM, itemBreakdown, itemsTotal, type JobItem } from "@/lib/job-items";
import { EMPTY_CLIENT, type ClientInfo } from "@/lib/documents";
import { formatPrice } from "@/lib/product-helpers";
import { downloadPdf } from "@/lib/pdf-download";
import { PresupuestoDocument } from "@/components/panel/documents/DocumentTemplates";
import NumberInput from "@/components/panel/NumberInput";
import { createOrderFromCotizadorAction, createQuoteAction } from "@/app/panel/(dashboard)/cotizador/actions";

const inputClass =
  "w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

export default function CotizadorForm({
  materials,
  moPerMinute,
  wholesalePct,
  retailPct,
  serviceTypes,
}: {
  materials: Material[];
  moPerMinute: number;
  wholesalePct: number;
  retailPct: number;
  serviceTypes: { value: string; label: string }[];
}) {
  const router = useRouter();
  const materialsById = useMemo(() => new Map(materials.map((m) => [m.id, m])), [materials]);

  const [items, setItems] = useState<JobItem[]>([{ ...EMPTY_JOB_ITEM }]);

  // --- Crear pedido ---
  const [fileNumber, setFileNumber] = useState("");
  const [orderClient, setOrderClient] = useState("");
  const [jobName, setJobName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pendiente");
  const [hasDeposit, setHasDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // --- Crear presupuesto ---
  const [client, setClient] = useState<ClientInfo>({ ...EMPTY_CLIENT });
  const [savingQuote, setSavingQuote] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const total = itemsTotal(items);
  const cleanItems = () => items.filter((i) => i.description.trim() !== "" || i.unitPrice > 0);

  function updateItem<K extends keyof JobItem>(index: number, key: K, value: JobItem[K]) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
    setSavedQuoteId(null);
  }
  function addItem() {
    setItems((rows) => [...rows, { ...EMPTY_JOB_ITEM }]);
  }
  function removeItem(index: number) {
    setItems((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }
  function updateClient<K extends keyof ClientInfo>(key: K, value: ClientInfo[K]) {
    setClient((c) => ({ ...c, [key]: value }));
    setSavedQuoteId(null);
  }

  async function handleCreateOrder() {
    setOrderError(null);
    if (!orderClient.trim() || !jobName.trim()) {
      setOrderError("Cliente y nombre del pedido son obligatorios.");
      return;
    }
    if (cleanItems().length === 0) {
      setOrderError("Cargá al menos un item con descripción o precio.");
      return;
    }
    setSavingOrder(true);
    try {
      await createOrderFromCotizadorAction({
        file_number: fileNumber,
        client_name: orderClient,
        job_name: jobName,
        due_date: dueDate || null,
        status: status as "pendiente" | "produccion" | "terminado" | "terminado_pagado",
        has_deposit: hasDeposit,
        deposit_amount: hasDeposit ? depositAmount ?? 0 : 0,
        items: cleanItems(),
      });
      router.push("/panel/pedidos");
    } catch {
      setOrderError("No se pudo crear el pedido. Probá de nuevo.");
      setSavingOrder(false);
    }
  }

  async function saveQuote(): Promise<number> {
    const id = await createQuoteAction({ client, items: cleanItems() });
    setSavedQuoteId(id);
    return id;
  }

  async function handleCreateQuote() {
    if (!client.nombre.trim()) return;
    setSavingQuote(true);
    try {
      await saveQuote();
      router.refresh();
    } finally {
      setSavingQuote(false);
    }
  }

  async function handleDownloadPdf() {
    setGeneratingPdf(true);
    try {
      const id = savedQuoteId ?? (await saveQuote());
      const num = `PRES-${id}`;
      await downloadPdf(
        <PresupuestoDocument client={client} items={cleanItems()} number={num} />,
        `presupuesto-${num}.pdf`
      );
      router.refresh();
    } finally {
      setGeneratingPdf(false);
    }
  }

  if (materials.length === 0) {
    return (
      <div className="rounded border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
        No hay materiales cargados todavía. Agregá alguno en{" "}
        <Link href="/panel/materiales" className="text-[#4e73df] underline">
          Materiales
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Link href="/panel/pedidos" className="flex items-center gap-1 text-sm font-semibold text-[#4e73df] hover:underline">
          Ir a Pedidos <ArrowRight size={15} />
        </Link>
      </div>

      {/* --- Items del trabajo --- */}
      <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-[#4e73df]">Items del trabajo</h2>
        <p className="mb-4 text-xs text-gray-400">
          Cargá cada item con material, medida y minutos — el cotizador calcula mayorista y minorista. Elegí uno como
          precio o escribilo a mano.
        </p>

        <div className="flex flex-col gap-4">
          {items.map((item, i) => {
            const bd = itemBreakdown(item, materialsById, moPerMinute, wholesalePct, retailPct);
            return (
              <div key={i} className="rounded border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-xs font-bold text-gray-400">Item {i + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-gray-400 hover:text-[#e74a3b]"
                      title="Sacar item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <label className="text-xs text-gray-500">
                    Material
                    <select
                      className={`mt-1 ${inputClass}`}
                      value={item.materialId ?? ""}
                      onChange={(e) => updateItem(i, "materialId", e.target.value === "" ? null : Number(e.target.value))}
                    >
                      <option value="">Sin especificar</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-gray-500">
                    Ancho (mm)
                    <NumberInput
                      className={`mt-1 ${inputClass}`}
                      step="any"
                      min="0"
                      placeholder="Ej: 300"
                      value={item.widthMm}
                      onValueChange={(v) => updateItem(i, "widthMm", v)}
                    />
                  </label>
                  <label className="text-xs text-gray-500">
                    Largo (mm)
                    <NumberInput
                      className={`mt-1 ${inputClass}`}
                      step="any"
                      min="0"
                      placeholder="Ej: 300"
                      value={item.lengthMm}
                      onValueChange={(v) => updateItem(i, "lengthMm", v)}
                    />
                  </label>
                  <label className="text-xs text-gray-500">
                    Minutos MO
                    <NumberInput
                      className={`mt-1 ${inputClass}`}
                      step="any"
                      min="0"
                      placeholder="Ej: 2"
                      value={item.moMinutes}
                      onValueChange={(v) => updateItem(i, "moMinutes", v)}
                    />
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <label className="text-xs text-gray-500 md:col-span-2">
                    Descripción
                    <input
                      className={`mt-1 ${inputClass}`}
                      value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Ej: Medallas en MDF con bicapa"
                    />
                  </label>
                  <label className="text-xs text-gray-500">
                    Tipo de servicio
                    <select
                      className={`mt-1 ${inputClass}`}
                      value={item.serviceType ?? ""}
                      onChange={(e) => updateItem(i, "serviceType", e.target.value === "" ? null : e.target.value)}
                    >
                      <option value="">Sin especificar</option>
                      {serviceTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  <label className="text-xs text-gray-500">
                    Cantidad
                    <NumberInput
                      className={`mt-1 ${inputClass}`}
                      min="0"
                      step="any"
                      value={item.quantity}
                      onValueChange={(v) => updateItem(i, "quantity", v ?? 0)}
                    />
                  </label>
                  <label className="text-xs text-gray-500">
                    Precio unitario ($)
                    <NumberInput
                      className={`mt-1 ${inputClass}`}
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onValueChange={(v) => {
                        updateItem(i, "unitPrice", v ?? 0);
                        updateItem(i, "priceMode", "manual");
                      }}
                    />
                  </label>
                  <div className="flex flex-col justify-end text-xs text-gray-500">
                    Subtotal
                    <span className="mt-1 py-2 text-sm font-bold text-gray-800">
                      {formatPrice(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                </div>

                {bd ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded bg-gray-50 px-3 py-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        updateItem(i, "unitPrice", Math.round(bd.wholesaleUnit * 100) / 100);
                        updateItem(i, "priceMode", "mayorista");
                      }}
                      className={`rounded px-2 py-1 font-semibold ${
                        item.priceMode === "mayorista" ? "bg-[#4e73df] text-white" : "bg-white text-[#4e73df] ring-1 ring-[#4e73df]/40"
                      }`}
                    >
                      Usar mayorista {formatPrice(bd.wholesaleUnit)}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateItem(i, "unitPrice", Math.round(bd.retailUnit * 100) / 100);
                        updateItem(i, "priceMode", "minorista");
                      }}
                      className={`rounded px-2 py-1 font-semibold ${
                        item.priceMode === "minorista" ? "bg-[#1cc88a] text-white" : "bg-white text-[#1cc88a] ring-1 ring-[#1cc88a]/40"
                      }`}
                    >
                      Usar minorista {formatPrice(bd.retailUnit)}
                    </button>
                    <span className="text-gray-500">
                      Mayorista × {item.quantity || 0} = <b>{formatPrice(bd.wholesaleLine)}</b> · Minorista × {item.quantity || 0} ={" "}
                      <b>{formatPrice(bd.retailLine)}</b>
                    </span>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400">
                    Cargá material, ancho y largo para ver mayorista/minorista sugeridos.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#4e73df] hover:underline"
        >
          <Plus size={14} /> Agregar item
        </button>

        <div className="mt-4 flex justify-end border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-500">
            Total: <b className="text-gray-800">{formatPrice(total)}</b>
          </span>
        </div>
      </div>

      {/* --- Crear pedido --- */}
      <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-[#4e73df]">Crear pedido</h2>
        <p className="mb-4 text-xs text-gray-400">
          Crea el pedido directo con los items de arriba. Después lo ves y lo movés en Pedidos.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <label className="text-xs text-gray-500">
            Nº de expediente
            <input className={`mt-1 ${inputClass}`} value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} placeholder="Opcional" />
          </label>
          <label className="text-xs text-gray-500">
            Cliente
            <input className={`mt-1 ${inputClass}`} value={orderClient} onChange={(e) => setOrderClient(e.target.value)} placeholder="Ej: Kiosco Don Mario" />
          </label>
          <label className="text-xs text-gray-500">
            Nombre del pedido / placa
            <input className={`mt-1 ${inputClass}`} value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="Ej: Cartel corpóreo MDF" />
          </label>
          <label className="text-xs text-gray-500">
            Fecha a entregar
            <input className={`mt-1 ${inputClass}`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label className="text-xs text-gray-500">
            Estado
            <select className={`mt-1 ${inputClass}`} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="produccion">En producción</option>
              <option value="terminado">Terminado</option>
              <option value="terminado_pagado">Terminado y pagado</option>
            </select>
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
        {orderError && <p className="mt-3 text-xs font-semibold text-[#e74a3b]">{orderError}</p>}
        <button
          type="button"
          disabled={savingOrder}
          onClick={handleCreateOrder}
          className="mt-4 rounded bg-[#1cc88a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17a674] disabled:opacity-60"
        >
          {savingOrder ? "Creando…" : "Crear pedido"}
        </button>
      </div>

      {/* --- Crear presupuesto --- */}
      <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-[#4e73df]">Crear presupuesto</h2>
        <p className="mb-4 text-xs text-gray-400">
          Guarda el presupuesto en{" "}
          <Link href="/panel/presupuestos" className="text-[#4e73df] hover:underline">
            Presupuestos
          </Link>
          . El PDF es aparte y opcional. Si el cliente acepta, ahí lo convertís en pedido.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
          <label className="text-xs text-gray-500">
            Otros datos
            <input className={`mt-1 ${inputClass}`} value={client.otrosDatos} onChange={(e) => updateClient("otrosDatos", e.target.value)} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={savingQuote || !client.nombre.trim()}
            onClick={handleCreateQuote}
            className="rounded bg-[#4e73df] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d5cc4] disabled:opacity-60"
          >
            {savingQuote ? "Guardando…" : "Crear presupuesto"}
          </button>
          <button
            type="button"
            disabled={generatingPdf || !client.nombre.trim()}
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-semibold text-[#1cc88a] ring-1 ring-[#1cc88a]/40 hover:bg-[#1cc88a]/5 disabled:opacity-60"
          >
            <FileDown size={16} />
            {generatingPdf ? "Generando…" : "Descargar PDF"}
          </button>
          {savedQuoteId !== null && (
            <span className="text-xs font-semibold text-[#1cc88a]">Guardado como PRES-{savedQuoteId}</span>
          )}
        </div>
      </div>
    </div>
  );
}
