import { MATERIALS_STOCK, AUX_SUPPLIES, getLowStockAlerts, WASTE_PCT, WASTE_BREAKDOWN } from "@/lib/materials-stock";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/panel/ProgressBar";
import { AlertTriangle, Boxes, Trash2 } from "lucide-react";

function StockTable({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; name: string; unit: string; stock: number; minThreshold: number }[];
}) {
  return (
    <div className="rounded border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold text-[#4e73df]">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Mínimo</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const low = row.stock < row.minThreshold;
              return (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{row.name}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {row.stock} {row.unit}
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {row.minThreshold} {row.unit}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        low ? "bg-[#e74a3b]/10 text-[#e74a3b]" : "bg-[#1cc88a]/10 text-[#1cc88a]"
                      }`}
                    >
                      {low ? "Stock bajo" : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function MaterialesPage() {
  const alerts = getLowStockAlerts();

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Materiales e insumos</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Alertas de stock bajo"
          value={String(alerts.length)}
          accent="red"
          icon={AlertTriangle}
          sublabel="Materiales + insumos"
        />
        <StatCard label="Desperdicio del mes" value={`${WASTE_PCT}%`} accent="yellow" icon={Trash2} sublabel="Sobre material consumido" />
        <StatCard
          label="Tipos de material en stock"
          value={String(MATERIALS_STOCK.length)}
          accent="blue"
          icon={Boxes}
          sublabel={`+ ${AUX_SUPPLIES.length} insumos auxiliares`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StockTable title="Láminas y planchas" rows={MATERIALS_STOCK} />
        <StockTable title="Insumos auxiliares" rows={AUX_SUPPLIES} />
      </div>

      <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Desglose de desperdicio (merma)</h2>
        <div className="flex flex-col gap-4">
          {WASTE_BREAKDOWN.map((w) => (
            <ProgressBar key={w.reason} label={w.reason} pct={w.pct} color="#f6c23e" />
          ))}
        </div>
      </div>
    </>
  );
}
