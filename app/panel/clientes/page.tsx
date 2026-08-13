import { CLIENTS, getClientTypeCounts, QUOTE_CONVERSION, AVG_RESPONSE_TIME_HOURS } from "@/lib/clients";
import StatCard from "@/components/StatCard";
import { Users, Percent, Clock3 } from "lucide-react";

export default async function ClientesPage() {
  const counts = getClientTypeCounts();
  const conversionPct = Math.round((QUOTE_CONVERSION.converted / QUOTE_CONVERSION.sent) * 100);

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Clientes</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Recurrentes vs esporádicos"
          value={`${counts.recurrente} / ${counts.esporadico}`}
          accent="blue"
          icon={Users}
          sublabel={`${CLIENTS.length} clientes en total`}
        />
        <StatCard
          label="Conversión de cotizaciones"
          value={`${conversionPct}%`}
          accent="green"
          icon={Percent}
          sublabel={`${QUOTE_CONVERSION.converted} de ${QUOTE_CONVERSION.sent} enviadas`}
        />
        <StatCard
          label="Tiempo medio de respuesta"
          value={`${AVG_RESPONSE_TIME_HOURS} hs`}
          accent="yellow"
          icon={Clock3}
          sublabel="Cotización enviada → respuesta"
        />
      </div>

      <div className="rounded border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-[#4e73df]">Listado de clientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Rubro</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3 text-right">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {CLIENTS.sort((a, b) => b.orders - a.orders).map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-gray-500">{c.segment}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.type === "recurrente" ? "bg-[#4e73df]/10 text-[#4e73df]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.type === "recurrente" ? "Recurrente" : "Esporádico"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">{c.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
