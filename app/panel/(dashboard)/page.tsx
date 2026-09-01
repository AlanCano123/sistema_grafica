import { getDebts, getDebtBalance } from "@/lib/business";
import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/product-helpers";
import { requireAdmin } from "@/lib/panel-auth";
import StatCard from "@/components/StatCard";
import SalesAreaChart from "@/components/panel/SalesAreaChart";
import DebtsDoughnutChart from "@/components/panel/DebtsDoughnutChart";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

// D1 solo existe en tiempo real del Worker — sin esto la página quedaría
// prerenderizada una vez en el build, sin poder leer la base todavía.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  await requireAdmin();
  const [debts, orders] = await Promise.all([getDebts(), getOrders()]);

  const receivables = debts.filter((d) => d.direction === "receivable" && d.status === "pending");
  const payables = debts.filter((d) => d.direction === "payable" && d.status === "pending");

  const totalReceivable = receivables.reduce((sum, d) => sum + getDebtBalance(d), 0);
  const totalPayable = payables.reduce((sum, d) => sum + getDebtBalance(d), 0);
  const balance = totalReceivable - totalPayable;

  // "Ventas" = pedidos terminados y pagados, por fecha de pago.
  const paidOrders = orders.filter((o) => o.status === "terminado_pagado");
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);

  const byDate = new Map<string, number>();
  for (const o of paidOrders) {
    const day = (o.paid_at ?? o.created_at ?? "").slice(0, 10);
    if (!day) continue;
    byDate.set(day, (byDate.get(day) ?? 0) + o.total_amount);
  }
  const sortedDates = Array.from(byDate.keys()).sort();
  const chartLabels = sortedDates.map((d) => new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }));
  const chartData = sortedDates.map((d) => byDate.get(d) ?? 0);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Resumen</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cobros pendientes" value={formatPrice(totalReceivable)} accent="green" icon={TrendingUp} sublabel={`${receivables.length} pendientes`} />
        <StatCard label="Pagos pendientes" value={formatPrice(totalPayable)} accent="red" icon={TrendingDown} sublabel={`${payables.length} pendientes`} />
        <StatCard label="Balance" value={formatPrice(balance)} accent={balance >= 0 ? "blue" : "yellow"} icon={Wallet} sublabel="Cobros − pagos pendientes" />
        <StatCard label="Ventas totales" value={formatPrice(totalSales)} accent="yellow" icon={DollarSign} sublabel={`${paidOrders.length} pedidos pagados`} />
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
