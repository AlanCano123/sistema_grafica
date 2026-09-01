import Link from "next/link";
import {
  budgetNumber,
  getBalance,
  getOnTimeStats,
  getOrders,
  getOrdersByStatus,
  isOverdue,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { parseItems } from "@/lib/job-items";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import { Clock, CheckCircle2, AlertTriangle, Wallet, Plus } from "lucide-react";
import { deleteOrderAction, updateOrderAction, updateOrderStatusAction } from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

const COLUMNS: { status: OrderStatus; title: string; accent: string }[] = [
  { status: "pendiente", title: "Pendientes / Aprobados", accent: "#f6c23e" },
  { status: "produccion", title: "En producción", accent: "#4e73df" },
  { status: "terminado", title: "Terminados", accent: "#1cc88a" },
  { status: "terminado_pagado", title: "Terminado y pagado", accent: "#13855c" },
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

function itemsSummary(order: Order): string[] {
  return parseItems(order.items).map(
    (it) => `${it.quantity || 1}× ${it.description.trim() || "(sin descripción)"}`
  );
}

interface PageProps {
  searchParams: Promise<{ view?: string; historial?: string }>;
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const { view, historial } = await searchParams;
  const verTodo = historial === "todo";
  const orders = await getOrders(verTodo ? undefined : sinceDate());

  return view === "cuentas" ? (
    <CuentasCorrientes orders={orders} verTodo={verTodo} />
  ) : (
    <Kanban orders={orders} verTodo={verTodo} />
  );
}

// --- Vista Kanban --------------------------------------------------------

function Kanban({ orders, verTodo }: { orders: Order[]; verTodo: boolean }) {
  const onTime = getOnTimeStats(orders);
  const enCola = getOrdersByStatus(orders, "pendiente").length + getOrdersByStatus(orders, "produccion").length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Pedidos</h1>
        <div className="flex items-center gap-4">
          <Link
            href={verTodo ? "/panel/pedidos" : "/panel/pedidos?historial=todo"}
            className="text-xs font-semibold text-gray-500 hover:underline"
          >
            {verTodo ? "Ver solo recientes" : `Ver historial completo (más de ${HISTORY_DAYS} días)`}
          </Link>
          <Link href="/panel/pedidos?view=cuentas" className="text-sm font-semibold text-[#4e73df] hover:underline">
            Ver cuentas corrientes →
          </Link>
          <Link
            href="/panel/cotizador"
            className="flex items-center gap-1 rounded bg-[#1cc88a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#17a674]"
          >
            <Plus size={15} /> Cargar pedido
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Cumplimiento a tiempo"
          value={`${onTime.pct}%`}
          accent="green"
          icon={CheckCircle2}
          sublabel={`${onTime.onTime} entregados a tiempo`}
        />
        <StatCard label="Entregas con retraso" value={String(onTime.late)} accent="red" icon={AlertTriangle} sublabel="Sobre el total de entregados" />
        <StatCard label="En cola" value={String(enCola)} accent="blue" icon={Clock} sublabel="Pendientes + en producción" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map(({ status, title, accent }) => {
          const columnOrders = getOrdersByStatus(orders, status);
          return (
            <div key={status} className="rounded border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold" style={{ color: accent }}>
                  {title}
                </h2>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: accent }}>
                  {columnOrders.length}
                </span>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {columnOrders.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">Nada acá.</p>
                ) : (
                  columnOrders.map((order) => <KanbanCard key={JSON.stringify(order)} order={order} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function KanbanCard({ order }: { order: Order }) {
  const balance = getBalance(order);
  const overdue = isOverdue(order);
  const done = order.status === "terminado" || order.status === "terminado_pagado";
  const formId = `status-${order.id}`;
  const items = itemsSummary(order);
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">
          #{order.id} · {budgetNumber(order)}
        </span>
        {order.due_date && (
          <span className={`text-xs ${overdue ? "font-bold text-[#e74a3b]" : "text-gray-400"}`}>
            {new Date(order.due_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium text-gray-800">{order.client_name}</p>
      <p className="text-xs text-gray-500">{order.job_name}</p>
      {items.length > 0 && (
        <ul className="mt-1 text-[11px] text-gray-400">
          {items.slice(0, 4).map((line, i) => (
            <li key={i}>· {line}</li>
          ))}
          {items.length > 4 && <li>· +{items.length - 4} más</li>}
        </ul>
      )}
      <p className="mt-1 text-xs font-semibold text-gray-600">Total {formatPrice(order.total_amount)}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {balance > 0 && (
          <span className="inline-block rounded-full bg-[#e74a3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#e74a3b]">
            Debe {formatPrice(balance)}
          </span>
        )}
        {overdue && (
          <span className="inline-block rounded-full bg-[#f6c23e]/20 px-2 py-0.5 text-[10px] font-bold text-[#b3860a]">
            Atrasado — venció el {new Date(order.due_date as string).toLocaleDateString("es-AR")}
          </span>
        )}
      </div>
      <form action={updateOrderStatusAction} id={formId} className="mt-2 flex flex-col gap-2">
        <input type="hidden" name="id" value={order.id} />
        <div className="flex items-center gap-2">
          <select name="status" defaultValue={order.status} className="rounded border border-gray-200 px-2 py-1 text-xs">
            {COLUMNS.map((c) => (
              <option key={c.status} value={c.status}>
                {STATUS_LABELS[c.status]}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded bg-[#4e73df] px-2 py-1 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
            Guardar
          </button>
        </div>
        {done && (
          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            ¿A tiempo?
            <select
              name="delivered_on_time"
              defaultValue={order.delivered_on_time === null ? "" : String(order.delivered_on_time)}
              className="rounded border border-gray-200 px-1.5 py-1 text-xs"
            >
              <option value="">—</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </label>
        )}
      </form>
    </div>
  );
}

// --- Vista Cuentas corrientes -------------------------------------------

function CuentasCorrientes({ orders, verTodo }: { orders: Order[]; verTodo: boolean }) {
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
        <div className="flex items-center gap-4">
          <Link
            href={verTodo ? "/panel/pedidos?view=cuentas" : "/panel/pedidos?view=cuentas&historial=todo"}
            className="text-xs font-semibold text-gray-500 hover:underline"
          >
            {verTodo ? "Ver solo recientes" : `Ver historial completo (más de ${HISTORY_DAYS} días)`}
          </Link>
          <Link href="/panel/pedidos" className="text-sm font-semibold text-[#4e73df] hover:underline">
            ← Ver tablero de pedidos
          </Link>
        </div>
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
            {COLUMNS.map((c) => (
              <option key={c.status} value={c.status}>
                {STATUS_LABELS[c.status]}
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
