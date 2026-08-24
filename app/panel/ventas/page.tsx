import { getSales, SERVICE_TYPES, type Sale } from "@/lib/business";
import { getOrders, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/product-helpers";
import { createSaleAction, deleteSaleAction, updateSaleAction } from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

const PAYMENT_METHODS = [
  { value: "", label: "—" },
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
];

function orderLabel(order: Order): string {
  return `#${order.order_number} · ${order.client_name}`;
}

// Nota HTML: <form> no puede ser hijo directo de <tbody> (envolviendo un
// <tr>) — es contenido inválido dentro de una tabla, el browser lo
// descarta al parsear, silenciosamente. Por eso cada fila usa el atributo
// `form` en sus inputs/botones para asociarse a un <form> real, declarado
// aparte (fuera de la tabla, ver abajo).
function SaleRow({ sale, orders }: { sale: Sale; orders: Order[] }) {
  const formId = `sale-${sale.id}`;
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input form={formId} type="hidden" name="id" value={sale.id} />
        <input form={formId} className={inputClass} name="description" defaultValue={sale.description} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="client_name" defaultValue={sale.client_name ?? ""} />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="sale_date" type="date" defaultValue={sale.sale_date} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="amount" type="number" step="any" defaultValue={sale.amount} required />
      </td>
      <td className="px-3 py-2">
        <select form={formId} name="payment_method" defaultValue={sale.payment_method ?? ""} className={inputClass}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select form={formId} name="service_type" defaultValue={sale.service_type ?? ""} className={inputClass}>
          <option value="">—</option>
          {SERVICE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select form={formId} name="order_id" defaultValue={sale.order_id ?? ""} className={inputClass}>
          <option value="">Ninguno</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {orderLabel(o)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button form={formId} type="submit" className="rounded bg-[#4e73df] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
          Guardar
        </button>{" "}
        <button
          form={formId}
          type="submit"
          formAction={deleteSaleAction}
          className="rounded bg-[#e74a3b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c8392c]"
        >
          Borrar
        </button>
      </td>
    </tr>
  );
}

function NewSaleRow({ orders }: { orders: Order[] }) {
  return (
    <tr>
      <td className="px-3 py-2">
        <input form="new-sale" className={inputClass} name="description" placeholder="Ej: Cartel corpóreo MDF" required />
      </td>
      <td className="px-3 py-2">
        <input form="new-sale" className={inputClass} name="client_name" placeholder="Cliente" />
      </td>
      <td className="px-3 py-2">
        <input form="new-sale" className={inputClass} name="sale_date" type="date" required />
      </td>
      <td className="px-3 py-2">
        <input form="new-sale" className={inputClass} name="amount" type="number" step="any" placeholder="0" required />
      </td>
      <td className="px-3 py-2">
        <select form="new-sale" name="payment_method" defaultValue="" className={inputClass}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select form="new-sale" name="service_type" defaultValue="" className={inputClass}>
          <option value="">—</option>
          {SERVICE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select form="new-sale" name="order_id" defaultValue="" className={inputClass}>
          <option value="">Ninguno</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {orderLabel(o)}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button form="new-sale" type="submit" className="rounded bg-[#1cc88a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#17a674]">
          Agregar
        </button>
      </td>
    </tr>
  );
}

export default async function VentasPage() {
  const [sales, orders] = await Promise.all([getSales(), getOrders()]);
  const total = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Ventas</h1>
        <span className="text-sm text-gray-500">
          Total: <span className="font-bold text-[#4e73df]">{formatPrice(total)}</span>
        </span>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Un pedido que llega a Terminado con saldo $0 genera la venta acá solo — no hace falta cargarla de nuevo a
        mano.
      </p>

      <div className="rounded border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                <th className="px-3 py-3">Descripción</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Monto</th>
                <th className="px-3 py-3">Medio de pago</th>
                <th className="px-3 py-3">Tipo de servicio</th>
                <th className="px-3 py-3">Pedido vinculado</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                // key incluye el contenido (no solo el id): los inputs de
                // SaleRow son "uncontrolled" (defaultValue) — React no les
                // actualiza el valor mostrado en un re-render normal, solo
                // al montar. Sin esto, tras "Guardar" la fila queda
                // visualmente con el valor viejo aunque la base ya se
                // actualizó.
                <SaleRow key={JSON.stringify(s)} sale={s} orders={orders} />
              ))}
              <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                <td colSpan={8} className="px-3 py-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Cargar venta
                </td>
              </tr>
              <NewSaleRow orders={orders} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms reales, fuera de la tabla (ver nota en SaleRow). */}
      {sales.map((s) => (
        <form key={s.id} id={`sale-${s.id}`} action={updateSaleAction} />
      ))}
      <form id="new-sale" action={createSaleAction} />
    </>
  );
}
