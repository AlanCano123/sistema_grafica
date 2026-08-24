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
import { getMaterials } from "@/lib/materials-db";
import type { Material } from "@/lib/materials";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import { Clock, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";
import { createOrderAction, deleteOrderAction, updateOrderAction, updateOrderStatusAction } from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

const COLUMNS: { status: OrderStatus; title: string; accent: string }[] = [
  { status: "pendiente", title: "Pendientes / Aprobados", accent: "#f6c23e" },
  { status: "produccion", title: "En producción", accent: "#4e73df" },
  { status: "terminado", title: "Terminados", accent: "#1cc88a" },
];

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  const [orders, materials] = await Promise.all([getOrders(), getMaterials()]);

  return view === "cuentas" ? (
    <CuentasCorrientes orders={orders} />
  ) : (
    <Kanban orders={orders} materials={materials} />
  );
}

// --- Vista Kanban --------------------------------------------------------

function Kanban({ orders, materials }: { orders: Order[]; materials: Material[] }) {
  const onTime = getOnTimeStats(orders);
  const enCola = getOrdersByStatus(orders, "pendiente").length + getOrdersByStatus(orders, "produccion").length;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Pedidos</h1>
        <Link href="/panel/pedidos?view=cuentas" className="text-sm font-semibold text-[#4e73df] hover:underline">
          Ver cuentas corrientes →
        </Link>
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

      <div className="mb-6 rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Cargar pedido</h2>
        <form action={createOrderAction} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <label className="text-xs text-gray-500">
            Nº de orden
            <input className={`mt-1 ${inputClass}`} name="order_number" placeholder="Ej: 1042" required />
          </label>
          <label className="text-xs text-gray-500">
            Nº de expediente
            <input className={`mt-1 ${inputClass}`} name="file_number" placeholder="Opcional" />
          </label>
          <label className="text-xs text-gray-500">
            Cliente
            <input className={`mt-1 ${inputClass}`} name="client_name" placeholder="Ej: Kiosco Don Mario" required />
          </label>
          <label className="text-xs text-gray-500">
            Nombre del pedido / placa
            <input className={`mt-1 ${inputClass}`} name="job_name" placeholder="Ej: Cartel corpóreo MDF" required />
          </label>
          <label className="text-xs text-gray-500">
            Estado
            <select className={`mt-1 ${inputClass}`} name="status" defaultValue="pendiente">
              <option value="pendiente">Pendiente</option>
              <option value="produccion">En producción</option>
              <option value="terminado">Terminado</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Fecha a entregar
            <input className={`mt-1 ${inputClass}`} name="due_date" type="date" />
          </label>
          <label className="text-xs text-gray-500">
            Total ($)
            <input className={`mt-1 ${inputClass}`} name="total_amount" type="number" step="any" placeholder="0" />
          </label>
          <label className="text-xs text-gray-500">
            Seña ($)
            <input className={`mt-1 ${inputClass}`} name="deposit_amount" type="number" step="any" placeholder="0" />
          </label>
          <label className="col-span-2 flex items-center gap-2 self-end pb-1.5 text-xs text-gray-500 md:col-span-1">
            <input type="checkbox" name="has_deposit" value="1" className="h-4 w-4" />
            Deja seña
          </label>
          <label className="text-xs text-gray-500">
            Material (opcional)
            <select className={`mt-1 ${inputClass}`} name="material_id" defaultValue="">
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
            <input className={`mt-1 ${inputClass}`} name="width_mm" type="number" step="any" placeholder="Opcional" />
          </label>
          <label className="text-xs text-gray-500">
            Largo (mm)
            <input className={`mt-1 ${inputClass}`} name="length_mm" type="number" step="any" placeholder="Opcional" />
          </label>
          <label className="text-xs text-gray-500">
            Minutos MO
            <input className={`mt-1 ${inputClass}`} name="mo_minutes" type="number" step="any" placeholder="Opcional" />
          </label>
          <p className="col-span-2 text-xs text-gray-400 md:col-span-4">
            Material/medidas/minutos son opcionales — sin ellos el pedido no calcula costo/margen en Finanzas, pero
            se carga igual.
          </p>
          <div className="col-span-2 flex items-end md:col-span-4">
            <button type="submit" className="rounded bg-[#1cc88a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17a674]">
              Cargar pedido
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                  // mismo motivo que en CuentaRow: el <select> de abajo es
                  // uncontrolled (defaultValue).
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
  const formId = `status-${order.id}`;
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">
          #{order.order_number} · {budgetNumber(order)}
        </span>
        {order.due_date && (
          <span className={`text-xs ${overdue ? "font-bold text-[#e74a3b]" : "text-gray-400"}`}>
            {new Date(order.due_date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium text-gray-800">{order.client_name}</p>
      <p className="text-xs text-gray-500">{order.job_name}</p>
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
            <option value="pendiente">Pendiente</option>
            <option value="produccion">En producción</option>
            <option value="terminado">Terminado</option>
          </select>
          <button type="submit" className="rounded bg-[#4e73df] px-2 py-1 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
            Guardar
          </button>
        </div>
        {order.status === "terminado" && (
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

// --- Vista Cuentas corrientes ---------------------------------------------

function CuentasCorrientes({ orders }: { orders: Order[] }) {
  const totalPendiente = orders.reduce((sum, o) => {
    const balance = getBalance(o);
    return balance > 0 ? sum + balance : sum;
  }, 0);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Cuentas corrientes</h1>
        <Link href="/panel/pedidos" className="text-sm font-semibold text-[#4e73df] hover:underline">
          ← Ver tablero de pedidos
        </Link>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Quién debe qué sobre sus pedidos — no confundir con Movimientos (esa es con proveedores/terceros).
      </p>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total pendiente de cobro" value={formatPrice(totalPendiente)} accent="red" icon={Wallet} sublabel="Suma de saldos > 0" />
      </div>

      <div className="rounded border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[9%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                <th className="px-3 py-3">Nº orden</th>
                <th className="px-3 py-3">Nº expediente</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Nombre de placa</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Total ($)</th>
                <th className="px-3 py-3">Seña ($)</th>
                <th className="px-3 py-3 text-right">Saldo</th>
                <th className="px-3 py-3">Formulario</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-sm text-gray-400">
                    No hay pedidos cargados todavía.
                  </td>
                </tr>
              ) : (
                // key incluye el contenido: los inputs son "uncontrolled"
                // (defaultValue) — sin esto, tras "Guardar" la fila queda
                // visualmente con el valor viejo aunque la base ya se
                // actualizó (React no resetea defaultValue en un
                // re-render normal, solo al montar).
                orders.map((o) => <CuentaRow key={JSON.stringify(o)} order={o} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms reales, fuera de la tabla — <form> no puede envolver un <tr>
          (HTML inválido, el browser lo descarta). Cada fila se asocia acá
          vía el atributo `form` (mismo patrón que Materiales/Configuración). */}
      {orders.map((o) => (
        <form key={o.id} id={`order-${o.id}`} action={updateOrderAction} />
      ))}
    </>
  );
}

function CuentaRow({ order }: { order: Order }) {
  const formId = `order-${order.id}`;
  const balance = getBalance(order);
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input form={formId} type="hidden" name="id" value={order.id} />
        <input form={formId} className={inputClass} name="order_number" defaultValue={order.order_number} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="file_number" defaultValue={order.file_number ?? ""} />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="client_name" defaultValue={order.client_name} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="job_name" defaultValue={order.job_name} required />
      </td>
      <td className="px-3 py-2">
        <select form={formId} name="status" defaultValue={order.status} className={inputClass}>
          <option value="pendiente">Pendiente</option>
          <option value="produccion">En producción</option>
          <option value="terminado">Terminado</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="total_amount" type="number" step="any" defaultValue={order.total_amount} />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <input form={formId} type="checkbox" name="has_deposit" value="1" defaultChecked={order.has_deposit === 1} className="h-4 w-4 shrink-0" />
          <input form={formId} className={inputClass} name="deposit_amount" type="number" step="any" defaultValue={order.deposit_amount} />
        </div>
      </td>
      <td className="px-3 py-2 text-right text-xs font-bold whitespace-nowrap text-gray-700">{formatPrice(balance)}</td>
      <td className="px-3 py-2">
        {/* Material/medidas/minutos no tienen su propio control acá (se
            sacó por espacio) — se cargan/editan solo desde "Cargar pedido"
            en el Kanban. Estos hidden pasan el valor actual sin cambios,
            así guardar desde acá no los borra. */}
        <input form={formId} type="hidden" name="material_id" value={order.material_id ?? ""} />
        <input form={formId} type="hidden" name="width_mm" value={order.width_mm ?? ""} />
        <input form={formId} type="hidden" name="length_mm" value={order.length_mm ?? ""} />
        <input form={formId} type="hidden" name="mo_minutes" value={order.mo_minutes ?? ""} />
        <select form={formId} name="form_paid" defaultValue={order.form_paid === null ? "" : String(order.form_paid)} className={inputClass}>
          <option value="">—</option>
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      </td>
      <td className="px-3 py-2">
        {/* delivered_on_time no tiene su propio control visible acá — se
            guarda como está (o null) salvo que se agregue más adelante;
            no es parte de lo pedido para esta vista. */}
        <input form={formId} type="hidden" name="delivered_on_time" value={order.delivered_on_time === null ? "" : String(order.delivered_on_time)} />
        <div className="flex flex-col gap-1">
          <button form={formId} type="submit" className="w-full rounded bg-[#4e73df] px-2 py-1 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
            Guardar
          </button>
          <button
            form={formId}
            type="submit"
            formAction={deleteOrderAction}
            className="w-full rounded bg-[#e74a3b] px-2 py-1 text-xs font-semibold text-white hover:bg-[#c8392c]"
          >
            Borrar
          </button>
        </div>
      </td>
    </tr>
  );
}
