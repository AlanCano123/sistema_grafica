import { computeMoRates, type OperatingCost } from "@/lib/materials";
import { getOperatingCosts, getPricingSettings } from "@/lib/materials-db";
import { formatPrice } from "@/lib/product-helpers";
import { requireAdmin } from "@/lib/panel-auth";
import StatCard from "@/components/StatCard";
import { Clock, DollarSign, Timer, Users, Wallet } from "lucide-react";
import {
  createOperatingCostAction,
  deleteOperatingCostAction,
  updateOperatingCostAction,
  updateSettingsAction,
} from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

// Nota HTML: <form> no puede ser hijo directo de <tbody> — es contenido
// inválido dentro de una tabla y el browser lo descarta al parsear,
// silenciosamente. Por eso cada fila usa el atributo `form` en sus
// inputs/botones para asociarse a un <form> real, declarado aparte (fuera
// de la tabla, ver abajo de <table> en CostTable).
function CostRow({ cost }: { cost: OperatingCost }) {
  const formId = `cost-${cost.id}`;
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input form={formId} type="hidden" name="id" value={cost.id} />
        <input form={formId} className={inputClass} name="name" defaultValue={cost.name} required />
      </td>
      <td className="px-3 py-2">
        <input form={formId} className={inputClass} name="amount" type="number" step="any" defaultValue={cost.amount} required />
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button form={formId} type="submit" className="rounded bg-[#4e73df] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
          Guardar
        </button>{" "}
        <button
          form={formId}
          type="submit"
          formAction={deleteOperatingCostAction}
          className="rounded bg-[#e74a3b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c8392c]"
        >
          Borrar
        </button>
      </td>
    </tr>
  );
}

function CostTable({
  title,
  category,
  costs,
  total,
}: {
  title: string;
  category: "operativo" | "rrhh";
  costs: OperatingCost[];
  total: number;
}) {
  return (
    <div className="rounded border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold text-[#4e73df]">{title}</h2>
        <span className="text-sm font-bold text-gray-700">{formatPrice(total)}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-3 py-3">Nombre</th>
              <th className="px-3 py-3">Monto ($)</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {/* key incluye el contenido: los inputs de CostRow son
                "uncontrolled" (defaultValue) — sin esto, tras "Guardar" la
                fila queda visualmente con el valor viejo aunque la base ya
                se actualizó (React no resetea defaultValue en un
                re-render normal, solo al montar). */}
            {costs.map((c) => (
              <CostRow key={JSON.stringify(c)} cost={c} />
            ))}
            <tr>
              <td className="px-3 py-2">
                <input form={`new-cost-${category}`} className={inputClass} name="name" placeholder="Ej: TUBO" required />
              </td>
              <td className="px-3 py-2">
                <input
                  form={`new-cost-${category}`}
                  className={inputClass}
                  name="amount"
                  type="number"
                  step="any"
                  placeholder="125000"
                  required
                />
              </td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <button
                  form={`new-cost-${category}`}
                  type="submit"
                  className="rounded bg-[#1cc88a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#17a674]"
                >
                  Agregar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Forms reales, fuera de la tabla (ver nota en CostRow). */}
      {costs.map((c) => (
        <form key={c.id} id={`cost-${c.id}`} action={updateOperatingCostAction} />
      ))}
      <form id={`new-cost-${category}`} action={createOperatingCostAction}>
        <input type="hidden" name="category" value={category} />
      </form>
    </div>
  );
}

export default async function ConfiguracionPage() {
  await requireAdmin();
  const [settings, costs] = await Promise.all([getPricingSettings(), getOperatingCosts()]);
  const operatingCosts = costs.filter((c) => c.category === "operativo");
  const payrollCosts = costs.filter((c) => c.category === "rrhh");
  const rates = computeMoRates(settings, costs);

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Configuración de precios</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Gastos operativos, sueldos y días/horas trabajados definen el Valor de Mano de Obra que usa la calculadora
        (misma fórmula que la planilla de costos). Los márgenes y el promedio de minutos de la calculadora pública
        se editan aparte, abajo.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Gasto operativo mensual" value={formatPrice(rates.operatingTotal)} accent="blue" icon={DollarSign} />
        <StatCard label="Gasto sueldos mensual" value={formatPrice(rates.payrollTotal)} accent="blue" icon={Users} />
        <StatCard label="Horas mensuales" value={rates.monthlyHours.toFixed(0)} accent="yellow" icon={Clock} />
        <StatCard label="Valor MO x Hora" value={formatPrice(rates.moPerHour)} accent="green" icon={Wallet} />
        <StatCard label="Valor MO x Minuto" value={formatPrice(rates.moPerMinute)} accent="green" icon={Timer} />
      </div>

      <div className="mb-6 rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Días, horas y márgenes</h2>
        <form action={updateSettingsAction} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <label className="text-xs text-gray-500">
            Días trabajados
            <input
              className={`mt-1 ${inputClass}`}
              name="working_days"
              type="number"
              step="1"
              defaultValue={settings.working_days}
              required
            />
          </label>
          <label className="text-xs text-gray-500">
            Días no trabajados
            <input
              className={`mt-1 ${inputClass}`}
              name="non_working_days"
              type="number"
              step="1"
              defaultValue={settings.non_working_days}
              required
            />
          </label>
          <label className="text-xs text-gray-500">
            Horas diarias
            <input
              className={`mt-1 ${inputClass}`}
              name="daily_hours"
              type="number"
              step="any"
              defaultValue={settings.daily_hours}
              required
            />
          </label>
          <label className="text-xs text-gray-500">
            Margen mayorista (%)
            <input
              className={`mt-1 ${inputClass}`}
              name="wholesale_margin_pct"
              type="number"
              step="any"
              defaultValue={settings.wholesale_margin_pct}
              required
            />
          </label>
          <label className="text-xs text-gray-500">
            Margen minorista (%)
            <input
              className={`mt-1 ${inputClass}`}
              name="retail_margin_pct"
              type="number"
              step="any"
              defaultValue={settings.retail_margin_pct}
              required
            />
          </label>
          <label className="text-xs text-gray-500">
            Minutos MO promedio (web)
            <input
              className={`mt-1 ${inputClass}`}
              name="avg_mo_minutes_web"
              type="number"
              step="any"
              defaultValue={settings.avg_mo_minutes_web}
              required
            />
          </label>
          <div className="col-span-2 flex items-end sm:col-span-3 lg:col-span-6">
            <button type="submit" className="rounded bg-[#4e73df] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d5cc4]">
              Guardar configuración
            </button>
          </div>
        </form>
        <p className="mt-3 text-xs text-gray-400">
          &quot;Días no trabajados&quot; es informativo — no entra en el cálculo de horas mensuales, igual que en la
          planilla original.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CostTable title="Gastos operativos" category="operativo" costs={operatingCosts} total={rates.operatingTotal} />
        <CostTable title="Recursos humanos" category="rrhh" costs={payrollCosts} total={rates.payrollTotal} />
      </div>
    </>
  );
}
