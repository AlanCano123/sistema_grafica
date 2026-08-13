import {
  SALES_BY_PERIOD,
  AVG_TICKET,
  SALES_BY_TYPE,
  MATERIAL_DEMAND,
  PROJECT_MARGINS,
  getProjectMargin,
  PENDING_QUOTES,
  PENDING_BALANCES,
} from "@/lib/finance";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/panel/ProgressBar";
import { DollarSign, Receipt, FileClock } from "lucide-react";

export default async function FinanzasPage() {
  const pendingQuotesTotal = PENDING_QUOTES.filter((q) => q.status === "pendiente").reduce(
    (sum, q) => sum + q.amount,
    0
  );

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Finanzas</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas del día" value={formatPrice(SALES_BY_PERIOD.daily)} accent="blue" icon={DollarSign} />
        <StatCard label="Ventas de la semana" value={formatPrice(SALES_BY_PERIOD.weekly)} accent="blue" icon={DollarSign} />
        <StatCard label="Ventas del mes" value={formatPrice(SALES_BY_PERIOD.monthly)} accent="blue" icon={DollarSign} />
        <StatCard label="Ticket promedio" value={formatPrice(AVG_TICKET)} accent="yellow" icon={Receipt} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Ventas por tipo de servicio</h2>
          <div className="flex flex-col gap-4">
            {SALES_BY_TYPE.map((s) => (
              <ProgressBar key={s.type} label={s.type} pct={s.pct} valueLabel={`${formatPrice(s.amount)} (${s.pct}%)`} />
            ))}
          </div>
        </div>

        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Material más solicitado</h2>
          <div className="flex flex-col gap-4">
            {MATERIAL_DEMAND.map((m) => (
              <ProgressBar key={m.material} label={m.material} pct={m.pct} color="#1cc88a" />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-[#4e73df]">Margen neto por proyecto</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                <th className="px-5 py-3">Proyecto</th>
                <th className="px-5 py-3 text-right">Costo (máquina+material+MO)</th>
                <th className="px-5 py-3 text-right">Precio cobrado</th>
                <th className="px-5 py-3 text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {PROJECT_MARGINS.map((p) => {
                const { cost, profit, marginPct } = getProjectMargin(p);
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{p.project}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatPrice(cost)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatPrice(p.pricedAt)}</td>
                    <td className={`px-5 py-3 text-right font-bold ${profit >= 0 ? "text-[#1cc88a]" : "text-[#e74a3b]"}`}>
                      {formatPrice(profit)} ({marginPct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-bold text-[#4e73df]">Cotizaciones pendientes</h2>
            <span className="flex items-center gap-1 text-xs font-bold text-[#f6c23e]">
              <FileClock size={14} />
              {formatPrice(pendingQuotesTotal)}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {PENDING_QUOTES.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{q.client}</p>
                  <p className="text-xs text-gray-400">
                    Enviada {new Date(q.sentDate).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{formatPrice(q.amount)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      q.status === "aprobado"
                        ? "bg-[#1cc88a]/10 text-[#1cc88a]"
                        : q.status === "rechazado"
                          ? "bg-[#e74a3b]/10 text-[#e74a3b]"
                          : "bg-[#f6c23e]/10 text-[#f6c23e]"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-bold text-[#4e73df]">Saldos pendientes de pago</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {PENDING_BALANCES.map((b) => {
              const due = b.total - b.paid;
              const pct = Math.round((b.paid / b.total) * 100);
              return (
                <div key={b.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{b.client}</p>
                    <span className="text-sm font-bold text-[#e74a3b]">Debe {formatPrice(due)}</span>
                  </div>
                  <ProgressBar label="" pct={pct} valueLabel={`Pagó ${formatPrice(b.paid)} de ${formatPrice(b.total)}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
