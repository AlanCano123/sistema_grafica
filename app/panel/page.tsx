import { getDebts, getDebtBalance, getSales } from "@/lib/business";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import SalesAreaChart from "@/components/panel/SalesAreaChart";
import DebtsDoughnutChart from "@/components/panel/DebtsDoughnutChart";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

// D1 solo existe en tiempo real del Worker — sin esto la página quedaría
// prerenderizada una vez en el build, sin poder leer la base todavía.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const [debts, sales] = await Promise.all([getDebts(), getSales()]);

  const receivables = debts.filter((d) => d.direction === "receivable" && d.status === "pending");
  const payables = debts.filter((d) => d.direction === "payable" && d.status === "pending");

  // Saldo (monto - pagado), no el monto bruto — un pago parcial ya
  // cargado no debe seguir contando entero acá.
  const totalReceivable = receivables.reduce((sum, d) => sum + getDebtBalance(d), 0);
  const totalPayable = payables.reduce((sum, d) => sum + getDebtBalance(d), 0);
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const balance = totalReceivable - totalPayable;

  // Ventas agrupadas por fecha para el gráfico de área, orden cronológico.
  const byDate = new Map<string, number>();
  for (const sale of sales) {
    byDate.set(sale.sale_date, (byDate.get(sale.sale_date) ?? 0) + sale.amount);
  }
  const sortedDates = Array.from(byDate.keys()).sort();
  const chartLabels = sortedDates.map((d) => new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }));
  const chartData = sortedDates.map((d) => byDate.get(d) ?? 0);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cobros pendientes" value={formatPrice(totalReceivable)} accent="green" icon={TrendingUp} sublabel={`${receivables.length} pendientes`} />
        <StatCard label="Pagos pendientes" value={formatPrice(totalPayable)} accent="red" icon={TrendingDown} sublabel={`${payables.length} pendientes`} />
        <StatCard label="Balance" value={formatPrice(balance)} accent={balance >= 0 ? "blue" : "yellow"} icon={Wallet} sublabel="Cobros − pagos pendientes" />
        <StatCard label="Ventas totales" value={formatPrice(totalSales)} accent="yellow" icon={DollarSign} sublabel={`${sales.length} ventas`} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Ventas en el tiempo</h2>
          <div className="h-64">
            <SalesAreaChart labels={chartLabels} data={chartData} />
          </div>
        </div>

        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Movimientos: quién a quién</h2>
          <div className="h-48">
            <DebtsDoughnutChart receivable={totalReceivable} payable={totalPayable} />
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#1cc88a]" /> Cobros pendientes
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#e74a3b]" /> Pagos pendientes
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
