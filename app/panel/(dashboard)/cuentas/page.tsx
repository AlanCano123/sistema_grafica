import Link from "next/link";
import { budgetNumber, getBalance, getOrders, type Order, type OrderStatus } from "@/lib/orders";
import { parseItems } from "@/lib/job-items";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import { Wallet } from "lucide-react";
import { deleteOrderAction, updateOrderAction } from "../pedidos/actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

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

const HISTORY_DAYS = 90;

function sinceDate(): string {
  return new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ historial?: string }>;
}

export default async function CuentasPage({ searchParams }: PageProps) {
  const { historial } = await searchParams;
  const verTodo = historial === "todo";
  const orders = await getOrders(verTodo ? undefined : sinceDate());

  // Agrupado por nombre de cliente.
  const byClient = new Map<string, Order[]>();
  for (const o of orders) {
    const list = byClient.get(o.client_name) ?? [];
    list.push(o);
    byClient.set(o.client_name, list);
  }
  const clients = Array.from(byClient.entries())
    .map(([name, list]) => ({
      name,
      orders: list,
      totalDebt: list.reduce((sum, o) => sum + Math.max(getBalance(o), 0), 0),
    }))
    .sort((a, b) => b.totalDebt - a.totalDebt);

  const totalPendiente = clients.reduce((sum, c) => sum + c.totalDebt, 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Cuentas corrientes</h1>
        <Link
          href={verTodo ? "/panel/cuentas" : "/panel/cuentas?historial=todo"}
          className="text-xs font-semibold text-gray-500 hover:underline"
        >
          {verTodo ? "Ver solo recientes" : `Ver historial completo (más de ${HISTORY_DAYS} días)`}
        </Link>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Deuda de cada cliente sobre sus pedidos — no confundir con Movimientos (esa es con proveedores/terceros).
      </p>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total pendiente de cobro" value={formatPrice(totalPendiente)} accent="red" icon={Wallet} sublabel="Suma de saldos > 0" />
      </div>

      {clients.length === 0 ? (
        <p className="rounded border border-gray-100 bg-white p-5 text-sm text-gray-400 shadow-sm">
          No hay pedidos cargados todavía.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c) => (
            <details key={c.name} className="rounded border border-gray-100 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-sm">
                <span className="font-bold text-gray-800">{c.name}</span>
                <span className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{c.orders.length} pedido(s)</span>
                  <span className={`font-bold ${c.totalDebt > 0 ? "text-[#e74a3b]" : "text-[#1cc88a]"}`}>
                    {c.totalDebt > 0 ? `Debe ${formatPrice(c.totalDebt)}` : "Al día"}
                  </span>
                </span>
              </summary>
              <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                {c.orders.map((o) => (
                  <CuentaOrderCard key={JSON.stringify(o)} order={o} />
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}

function CuentaOrderCard({ order }: { order: Order }) {
  const balance = getBalance(order);
  const items = parseItems(order.items);
  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-gray-400">
          #{order.id} · {budgetNumber(order)} · {STATUS_LABELS[order.status]}
        </span>
        <span className={`text-sm font-bold ${balance > 0 ? "text-[#e74a3b]" : "text-gray-600"}`}>
          Saldo {formatPrice(balance)}
        </span>
      </div>

      {items.length > 0 && (
        <ul className="mb-3 text-xs text-gray-500">
          {items.map((it, i) => (
            <li key={i}>
              · {it.quantity || 1}× {it.description.trim() || "(sin descripción)"} — {formatPrice(it.quantity * it.unitPrice)}
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
