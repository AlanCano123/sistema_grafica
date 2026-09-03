"use client";

import { useEffect, useRef, useState } from "react";
import { budgetNumber, getBalance, type Order, type OrderStatus } from "@/lib/orders";
import { parseItems } from "@/lib/job-items";
import { PROVIDER_LABELS } from "@/lib/providers";
import { formatPrice } from "@/lib/product-helpers";
import { deleteOrderAction, updateOrderAction } from "@/app/panel/(dashboard)/pedidos/actions";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "produccion", label: "En producción" },
  { value: "terminado", label: "Terminado" },
  { value: "terminado_pagado", label: "Terminado y pagado" },
];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  produccion: "En producción",
  terminado: "Terminado",
  terminado_pagado: "Terminado y pagado",
};

// Pedidos de un cliente, colapsados (mismo criterio que los items del
// Cotizador): cada fila muestra solo número + saldo; click para expandir y
// ver fechas/estado/seña/formulario/borrar. Uno solo abierto a la vez;
// click afuera de la lista colapsa el que estaba abierto.
export default function ClientOrders({ orders }: { orders: Order[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openId === null) return;
    function onDown(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setOpenId(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openId]);

  return (
    <div ref={listRef} className="flex flex-col divide-y divide-gray-100">
      {orders.map((o) =>
        openId === o.id ? (
          <OrderCard key={JSON.stringify(o)} order={o} onCollapse={() => setOpenId(null)} />
        ) : (
          <button
            key={o.id}
            type="button"
            onClick={() => setOpenId(o.id)}
            className="flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-gray-50"
          >
            <span className="text-xs font-bold text-gray-400">
              #{o.id} · {budgetNumber(o)} · {STATUS_LABELS[o.status]}
            </span>
            <span className={`text-sm font-bold ${getBalance(o) > 0 ? "text-[#e74a3b]" : "text-gray-600"}`}>
              Saldo {formatPrice(getBalance(o))}
            </span>
          </button>
        )
      )}
    </div>
  );
}

function OrderCard({ order, onCollapse }: { order: Order; onCollapse: () => void }) {
  const balance = getBalance(order);
  const items = parseItems(order.items);
  return (
    <div className="bg-[#4e73df]/5 px-5 py-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-gray-400">
          #{order.id} · {budgetNumber(order)} · {STATUS_LABELS[order.status]}
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${balance > 0 ? "text-[#e74a3b]" : "text-gray-600"}`}>
            Saldo {formatPrice(balance)}
          </span>
          <button type="button" onClick={onCollapse} className="text-xs font-semibold text-gray-400 hover:text-gray-700">
            Colapsar
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="mb-3 text-xs text-gray-500">
          {items.map((it, i) => (
            <li key={i}>
              · {it.quantity || 1}× {it.description.trim() || "(sin descripción)"}
              {it.provider && <span className="text-gray-400"> [{PROVIDER_LABELS[it.provider]}]</span>} —{" "}
              {formatPrice(it.quantity * it.unitPrice)}
            </li>
          ))}
        </ul>
      )}

      <form action={updateOrderAction} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input type="hidden" name="id" value={order.id} />
        <input type="hidden" name="items" value={order.items} />
        <input type="hidden" name="delivered_on_time" value={order.delivered_on_time === null ? "" : String(order.delivered_on_time)} />
        <label className="text-xs text-gray-500">
          Cliente
          <input className={`mt-1 ${inputClass}`} name="client_name" defaultValue={order.client_name} required />
        </label>
        <label className="text-xs text-gray-500">
          Nombre del pedido
          <input className={`mt-1 ${inputClass}`} name="job_name" defaultValue={order.job_name} required />
        </label>
        <label className="text-xs text-gray-500">
          Nº expediente
          <input className={`mt-1 ${inputClass}`} name="file_number" defaultValue={order.file_number ?? ""} />
        </label>
        <label className="text-xs text-gray-500">
          Fecha a entregar
          <input className={`mt-1 ${inputClass}`} name="due_date" type="date" defaultValue={order.due_date ?? ""} />
        </label>
        <label className="text-xs text-gray-500">
          Estado
          <select className={`mt-1 ${inputClass}`} name="status" defaultValue={order.status}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-xs text-gray-500">
          <input type="checkbox" name="has_deposit" value="1" defaultChecked={order.has_deposit === 1} className="h-4 w-4" />
          Deja seña
        </label>
        <label className="text-xs text-gray-500">
          Seña ($)
          <input className={`mt-1 ${inputClass}`} name="deposit_amount" type="number" step="any" defaultValue={order.deposit_amount} />
        </label>
        <label className="text-xs text-gray-500">
          Formulario pago
          <select className={`mt-1 ${inputClass}`} name="form_paid" defaultValue={order.form_paid === null ? "" : String(order.form_paid)}>
            <option value="">—</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>
        <div className="col-span-2 flex items-end gap-2 md:col-span-4">
          <button type="submit" className="rounded bg-[#4e73df] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
            Guardar
          </button>
          <button
            type="submit"
            formAction={deleteOrderAction}
            className="rounded bg-[#e74a3b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c8392c]"
          >
            Borrar
          </button>
          <span className="ml-auto self-center text-xs text-gray-400">Total {formatPrice(order.total_amount)}</span>
        </div>
      </form>
    </div>
  );
}
