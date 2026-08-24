import { getDebts, getDebtBalance, type Debt } from "@/lib/business";
import { formatPrice } from "@/lib/product-helpers";
import { createDebtAction, deleteDebtAction, updateDebtAction } from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

// Nota HTML: <form> no puede ser hijo directo de <tbody> (envolviendo un
// <tr>) — es contenido inválido dentro de una tabla, el browser lo
// descarta al parsear, silenciosamente. Por eso cada fila usa el atributo
// `form` en sus inputs/botones para asociarse a un <form> real, declarado
// aparte (fuera de la tabla, ver abajo de DebtTable).
function DebtRow({ debt }: { debt: Debt }) {
  const formId = `debt-${debt.id}`;
  const balance = getDebtBalance(debt);
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input form={formId} type="hidden" name="id" value={debt.id} />
        <select form={formId} name="direction" defaultValue={debt.direction} className={inputClass}>
          <option value="receivable">Cobros pendientes</option>
          <option value="payable">Pagos pendientes</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="counterparty_name" defaultValue={debt.counterparty_name} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="description" defaultValue={debt.description ?? ""} />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="due_date" type="date" defaultValue={debt.due_date ?? ""} />
      </td>
      <td className="px-3 py-2">
        <select form={formId} name="status" defaultValue={debt.status} className={inputClass}>
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="amount" type="number" step="any" defaultValue={debt.amount} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="paid_amount" type="number" step="any" defaultValue={debt.paid_amount} />
      </td>
      <td className="px-3 py-2 text-right text-xs font-bold whitespace-nowrap text-gray-700">{formatPrice(balance)}</td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <button form={formId} type="submit" className="w-full rounded bg-[#4e73df] px-2 py-1 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
            Guardar
          </button>
          <button
            form={formId}
            type="submit"
            formAction={deleteDebtAction}
            className="w-full rounded bg-[#e74a3b] px-2 py-1 text-xs font-semibold text-white hover:bg-[#c8392c]"
          >
            Borrar
          </button>
        </div>
      </td>
    </tr>
  );
}

function DebtTable({ title, debts, accent }: { title: string; debts: Debt[]; accent: string }) {
  const totalPendiente = debts.reduce((sum, d) => {
    const balance = getDebtBalance(d);
    return balance > 0 ? sum + balance : sum;
  }, 0);

  return (
    <div className="rounded border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold" style={{ color: accent }}>
          {title}
        </h2>
        <span className="text-sm font-bold" style={{ color: accent }}>
          {formatPrice(totalPendiente)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-3 py-3">Dirección</th>
              <th className="px-3 py-3">Contraparte</th>
              <th className="px-3 py-3">Descripción</th>
              <th className="px-3 py-3">Vence</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Monto ($)</th>
              <th className="px-3 py-3">Pagado ($)</th>
              <th className="px-3 py-3 text-right">Saldo</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {debts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-sm text-gray-400">
                  Nada cargado por acá.
                </td>
              </tr>
            ) : (
              // key incluye el contenido: los inputs son "uncontrolled"
              // (defaultValue) — sin esto, tras "Guardar" la fila queda
              // visualmente con el valor viejo aunque la base ya se
              // actualizó (React no resetea defaultValue en un re-render
              // normal, solo al montar).
              debts.map((d) => <DebtRow key={JSON.stringify(d)} debt={d} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Forms reales, fuera de la tabla (ver nota en DebtRow). */}
      {debts.map((d) => (
        <form key={d.id} id={`debt-${d.id}`} action={updateDebtAction} />
      ))}
    </div>
  );
}

export default async function DeudasPage() {
  const debts = await getDebts();
  const receivables = debts.filter((d) => d.direction === "receivable");
  const payables = debts.filter((d) => d.direction === "payable");

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Movimientos</h1>

      <div className="mb-6 rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Cargar movimiento</h2>
        <form action={createDebtAction} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <label className="text-xs text-gray-500">
            Dirección
            <select className={`mt-1 ${inputClass}`} name="direction" defaultValue="receivable">
              <option value="receivable">Cobros pendientes</option>
              <option value="payable">Pagos pendientes</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Contraparte
            <input className={`mt-1 ${inputClass}`} name="counterparty_name" placeholder="Ej: Kiosco Don Mario" required />
          </label>
          <label className="text-xs text-gray-500">
            Descripción
            <input className={`mt-1 ${inputClass}`} name="description" placeholder="Opcional" />
          </label>
          <label className="text-xs text-gray-500">
            Vence
            <input className={`mt-1 ${inputClass}`} name="due_date" type="date" />
          </label>
          <label className="text-xs text-gray-500">
            Estado
            <select className={`mt-1 ${inputClass}`} name="status" defaultValue="pending">
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </label>
          <label className="text-xs text-gray-500">
            Monto ($)
            <input className={`mt-1 ${inputClass}`} name="amount" type="number" step="any" placeholder="0" required />
          </label>
          <label className="text-xs text-gray-500">
            Pagado ($)
            <input className={`mt-1 ${inputClass}`} name="paid_amount" type="number" step="any" placeholder="0" />
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded bg-[#1cc88a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17a674]">
              Cargar movimiento
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        <DebtTable title="Cobros pendientes" debts={receivables} accent="#1cc88a" />
        <DebtTable title="Pagos pendientes" debts={payables} accent="#e74a3b" />
      </div>
    </>
  );
}
