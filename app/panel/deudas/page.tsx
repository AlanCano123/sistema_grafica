import { getDebts, Debt } from "@/lib/business";
import { formatPrice } from "@/lib/product-helpers";

function StatusBadge({ status }: { status: Debt["status"] }) {
  const isPaid = status === "paid";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        isPaid ? "bg-[#1cc88a]/10 text-[#1cc88a]" : "bg-[#f6c23e]/10 text-[#f6c23e]"
      }`}
    >
      {isPaid ? "Pagado" : "Pendiente"}
    </span>
  );
}

function DebtTable({ title, debts, accent }: { title: string; debts: Debt[]; accent: string }) {
  return (
    <div className="rounded border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold" style={{ color: accent }}>
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-5 py-3">Contraparte</th>
              <th className="px-5 py-3">Descripción</th>
              <th className="px-5 py-3">Vence</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {debts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Nada cargado por acá.
                </td>
              </tr>
            ) : (
              debts.map((debt) => (
                <tr key={debt.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{debt.counterparty_name}</td>
                  <td className="px-5 py-3 text-gray-500">{debt.description ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {debt.due_date ? new Date(debt.due_date).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={debt.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-bold" style={{ color: accent }}>
                    {formatPrice(debt.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function DeudasPage() {
  const debts = await getDebts();
  const receivables = debts.filter((d) => d.direction === "receivable");
  const payables = debts.filter((d) => d.direction === "payable");

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Deudas</h1>

      <div className="flex flex-col gap-6">
        <DebtTable title="Te deben" debts={receivables} accent="#1cc88a" />
        <DebtTable title="Vos debés" debts={payables} accent="#e74a3b" />
      </div>
    </>
  );
}
