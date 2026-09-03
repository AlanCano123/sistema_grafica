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
import { PROVIDER_LABELS, type Provider } from "@/lib/providers";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import { Clock, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { updateOrderStatusAction } from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

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
  return parseItems(order.items).map((it) => `${it.quantity || 1}× ${it.description.trim() || "(sin descripción)"}`);
}

/** "CDO 2 · Maya 1" — cuántos items comprar a cada proveedor. "" si ninguno tiene proveedor. */
function providerTally(order: Order): string {
  const by = new Map<Provider, number>();
  for (const it of parseItems(order.items)) {
    if (it.provider) by.set(it.provider, (by.get(it.provider) ?? 0) + 1);
  }
  return Array.from(by.entries())
    .map(([p, n]) => `${PROVIDER_LABELS[p]} ${n}`)
    .join(" · ");
}

interface PageProps {
  searchParams: Promise<{ historial?: string }>;
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const { historial } = await searchParams;
  const verTodo = historial === "todo";
  const orders = await getOrders(verTodo ? undefined : sinceDate());

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
      {providerTally(order) && (
        <p className="mt-0.5 text-[11px] text-gray-400">Comprar: {providerTally(order)}</p>
      )}
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
