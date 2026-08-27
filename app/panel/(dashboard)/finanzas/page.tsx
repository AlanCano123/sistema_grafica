import Link from "next/link";
import { getSales, SERVICE_TYPES } from "@/lib/business";
import { getBalance, getOrderCost, getOrders, type Order } from "@/lib/orders";
import { getMaterials, getOperatingCosts, getPricingSettings } from "@/lib/materials-db";
import { computeMoRates, type Material } from "@/lib/materials";
import { formatPrice } from "@/lib/product-helpers";
import { requireAdmin } from "@/lib/panel-auth";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/panel/ProgressBar";
import { DollarSign, Receipt } from "lucide-react";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const PALETTE = ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b", "#36b9cc", "#858796", "#5a5c69", "#fd7e14"];

// Por default, ventas/pedidos de los últimos 90 días (+ pedidos activos o
// con saldo, sin importar la fecha — ver getOrders). "Saldos pendientes de
// pago" nunca se ve afectado por esto (ya filtra por saldo > 0, que
// getOrders siempre incluye). "Ver historial completo" saca el filtro.
const HISTORY_DAYS = 90;

function sinceDate(): string {
  return new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ historial?: string }>;
}

export default async function FinanzasPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { historial } = await searchParams;
  const verTodo = historial === "todo";
  const [sales, orders, materials, settings, costs] = await Promise.all([
    getSales(verTodo ? undefined : sinceDate()),
    getOrders(verTodo ? undefined : sinceDate()),
    getMaterials(),
    getPricingSettings(),
    getOperatingCosts(),
  ]);
  const moPerMinute = computeMoRates(settings, costs).moPerMinute;
  const materialsById = new Map<number, Material>(materials.map((m) => [m.id, m]));

  // --- StatCards: ventas día/semana/mes + ticket promedio -----------------
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7); // 'YYYY-MM'

  const salesToday = sales.filter((s) => s.sale_date === today).reduce((sum, s) => sum + s.amount, 0);
  const salesWeek = sales.filter((s) => s.sale_date >= sevenDaysAgo).reduce((sum, s) => sum + s.amount, 0);
  const salesMonth = sales.filter((s) => s.sale_date.startsWith(currentMonth)).reduce((sum, s) => sum + s.amount, 0);
  const avgTicket = sales.length > 0 ? sales.reduce((sum, s) => sum + s.amount, 0) / sales.length : 0;

  // --- Ventas por tipo de servicio ----------------------------------------
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.amount, 0);
  const byServiceType = new Map<string, number>();
  for (const s of sales) {
    const key = s.service_type ?? "sin_especificar";
    byServiceType.set(key, (byServiceType.get(key) ?? 0) + s.amount);
  }
  const serviceTypeLabel = (value: string) =>
    value === "sin_especificar" ? "Sin especificar" : (SERVICE_TYPES.find((t) => t.value === value)?.label ?? value);
  const salesByType = Array.from(byServiceType.entries())
    .map(([value, amount]) => ({
      label: serviceTypeLabel(value),
      amount,
      pct: totalSalesAmount > 0 ? Math.round((amount / totalSalesAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // --- Material más solicitado ---------------------------------------------
  const ordersWithMaterial = orders.filter((o) => o.material_id !== null);
  const byMaterial = new Map<number, number>();
  for (const o of ordersWithMaterial) {
    byMaterial.set(o.material_id as number, (byMaterial.get(o.material_id as number) ?? 0) + 1);
  }
  const materialDemand = Array.from(byMaterial.entries())
    .map(([materialId, count]) => ({
      material: materialsById.get(materialId)?.name ?? `Material #${materialId}`,
      count,
      pct: ordersWithMaterial.length > 0 ? Math.round((count / ordersWithMaterial.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // --- Margen neto por proyecto --------------------------------------------
  const projectMargins = orders
    .map((o) => {
      const result = getOrderCost(o, materialsById.get(o.material_id ?? -1), moPerMinute);
      return result ? { order: o, ...result } : null;
    })
    .filter((x): x is { order: Order; cost: number; margin: number; marginPct: number } => x !== null);

  // --- Saldos pendientes de pago (misma data que Cuentas corrientes) ------
  const pendingBalances = orders
    .map((o) => ({ order: o, balance: getBalance(o) }))
    .filter((x) => x.balance > 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Finanzas</h1>
        <Link
          href={verTodo ? "/panel/finanzas" : "/panel/finanzas?historial=todo"}
          className="text-xs font-semibold text-gray-500 hover:underline"
        >
          {verTodo ? "Ver solo recientes" : `Ver historial completo (más de ${HISTORY_DAYS} días)`}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas del día" value={formatPrice(salesToday)} accent="blue" icon={DollarSign} />
        <StatCard label="Ventas de la semana" value={formatPrice(salesWeek)} accent="blue" icon={DollarSign} sublabel="Últimos 7 días" />
        <StatCard label="Ventas del mes" value={formatPrice(salesMonth)} accent="blue" icon={DollarSign} />
        <StatCard
          label="Ticket promedio"
          value={formatPrice(avgTicket)}
          accent="yellow"
          icon={Receipt}
          sublabel={`${sales.length} ventas ${verTodo ? "en total" : `(últimos ${HISTORY_DAYS} días)`}`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Ventas por tipo de servicio</h2>
          {salesByType.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no hay ventas cargadas.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {salesByType.map((s, i) => (
                <ProgressBar key={s.label} label={s.label} pct={s.pct} color={PALETTE[i % PALETTE.length]} valueLabel={`${formatPrice(s.amount)} (${s.pct}%)`} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Material más solicitado</h2>
          {materialDemand.length === 0 ? (
            <p className="text-sm text-gray-400">
              Ningún pedido tiene material cargado todavía — se completa opcionalmente al cargar el pedido.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {materialDemand.map((m, i) => (
                <ProgressBar key={m.material} label={m.material} pct={m.pct} color={PALETTE[i % PALETTE.length]} valueLabel={`${m.count} pedido(s) (${m.pct}%)`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-[#4e73df]">Margen neto por proyecto</h2>
          <p className="mt-1 text-xs text-gray-400">
            Costo = material + mano de obra, con las tarifas/costos actuales (no es una foto histórica congelada).
          </p>
        </div>
        {projectMargins.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            Ningún pedido tiene material, medidas y minutos de MO cargados todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                  <th className="px-5 py-3">Proyecto</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3 text-right">Costo</th>
                  <th className="px-5 py-3 text-right">Precio cobrado</th>
                  <th className="px-5 py-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {projectMargins.map(({ order, cost, margin, marginPct }) => (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{order.job_name}</td>
                    <td className="px-5 py-3 text-gray-500">{order.client_name}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatPrice(cost)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatPrice(order.total_amount)}</td>
                    <td className={`px-5 py-3 text-right font-bold ${margin >= 0 ? "text-[#1cc88a]" : "text-[#e74a3b]"}`}>
                      {formatPrice(margin)} ({Math.round(marginPct)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-[#4e73df]">Saldos pendientes de pago</h2>
          <p className="mt-1 text-xs text-gray-400">
            Mismos pedidos que Cuentas corrientes en Pedidos — para editar el pago, hacelo ahí.
          </p>
        </div>
        {pendingBalances.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No hay saldos pendientes.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingBalances.map(({ order, balance }) => {
              const paid = order.has_deposit ? order.deposit_amount : 0;
              const pct = order.total_amount > 0 ? Math.round((paid / order.total_amount) * 100) : 0;
              return (
                <div key={order.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {order.client_name} <span className="text-gray-400">— #{order.order_number}</span>
                    </p>
                    <span className="text-sm font-bold text-[#e74a3b]">Debe {formatPrice(balance)}</span>
                  </div>
                  <ProgressBar label="" pct={pct} valueLabel={`Pagó ${formatPrice(paid)} de ${formatPrice(order.total_amount)}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
