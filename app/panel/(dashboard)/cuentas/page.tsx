import Link from "next/link";
import { getBalance, getOrders, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import { Wallet } from "lucide-react";
import ClientOrders from "@/components/panel/cuentas/ClientOrders";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const HISTORY_DAYS = 90;

function sinceDate(): string {
  return new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{ historial?: string }>;
}

export default async function CuentasPage({ searchParams }: PageProps) {
  const { historial } = await searchParams;
  const verTodo = historial === "todo";
  const orders = await getOrders(verTodo ? undefined : sinceDate());

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
        <Link
          href={verTodo ? "/panel/cuentas" : "/panel/cuentas?historial=todo"}
          className="text-xs font-semibold text-gray-500 hover:underline"
        >
          {verTodo ? "Ver solo recientes" : `Ver historial completo (más de ${HISTORY_DAYS} días)`}
        </Link>
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
              <div className="border-t border-gray-100">
                <ClientOrders orders={c.orders} />
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
