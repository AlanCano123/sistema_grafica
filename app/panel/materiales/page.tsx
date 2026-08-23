import { MATERIALS_STOCK, AUX_SUPPLIES, getLowStockAlerts, WASTE_PCT, WASTE_BREAKDOWN } from "@/lib/materials-stock";
import { materialRatePerMm2, type Material } from "@/lib/materials";
import { getMaterials } from "@/lib/materials-db";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/panel/ProgressBar";
import { AlertTriangle, Boxes, Trash2 } from "lucide-react";
import { createMaterialAction, deleteMaterialAction, updateMaterialAction } from "./actions";

// D1 solo existe en tiempo real del Worker — sin esto la página quedaría
// prerenderizada una vez en el build, sin poder leer la tabla de materiales.
export const dynamic = "force-dynamic";

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

const inputClass =
  "w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

// Nota HTML: <form> no puede ser hijo directo de <tbody> (envolviendo un
// <tr>) — es contenido inválido dentro de una tabla y el browser lo
// descarta al parsear, silenciosamente. Por eso cada fila usa el atributo
// `form` en sus inputs/botones para asociarse a un <form> real, declarado
// aparte (fuera de la tabla, ver abajo de <table> en MaterialsCalcTable).
function MaterialRow({ material }: { material: Material }) {
  const rate = materialRatePerMm2(material);
  const formId = `material-${material.id}`;
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2">
        <input form={formId} type="hidden" name="id" value={material.id} />
        <input form={formId} className={inputClass} name="name" defaultValue={material.name} required />
      </td>
      <td className="px-3 py-2">
        <input
          form={formId}
          className={inputClass}
          name="thickness_mm"
          type="number"
          step="any"
          defaultValue={material.thickness_mm}
          required
        />
      </td>
      <td className="px-3 py-2">
        <input
          form={formId}
          className={inputClass}
          name="sheet_width_mm"
          type="number"
          step="any"
          defaultValue={material.sheet_width_mm}
          required
        />
      </td>
      <td className="px-3 py-2">
        <input
          form={formId}
          className={inputClass}
          name="sheet_length_mm"
          type="number"
          step="any"
          defaultValue={material.sheet_length_mm}
          required
        />
      </td>
      <td className="px-3 py-2">
        <input
          form={formId}
          className={inputClass}
          name="sheet_cost"
          type="number"
          step="any"
          defaultValue={material.sheet_cost}
          required
        />
      </td>
      <td className="px-3 py-2 text-right text-xs text-gray-500 whitespace-nowrap">{formatPrice(rate)}/mm²</td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button form={formId} type="submit" className="rounded bg-[#4e73df] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
          Guardar
        </button>{" "}
        <button
          form={formId}
          type="submit"
          formAction={deleteMaterialAction}
          className="rounded bg-[#e74a3b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c8392c]"
        >
          Borrar
        </button>
      </td>
    </tr>
  );
}

function NewMaterialRow() {
  return (
    <tr>
      <td className="px-3 py-2">
        <input form="new-material" className={inputClass} name="name" placeholder="Ej: MDF 3mm" required />
      </td>
      <td className="px-3 py-2">
        <input form="new-material" className={inputClass} name="thickness_mm" type="number" step="any" placeholder="3" required />
      </td>
      <td className="px-3 py-2">
        <input
          form="new-material"
          className={inputClass}
          name="sheet_width_mm"
          type="number"
          step="any"
          placeholder="1830"
          required
        />
      </td>
      <td className="px-3 py-2">
        <input
          form="new-material"
          className={inputClass}
          name="sheet_length_mm"
          type="number"
          step="any"
          placeholder="2600"
          required
        />
      </td>
      <td className="px-3 py-2">
        <input form="new-material" className={inputClass} name="sheet_cost" type="number" step="any" placeholder="42000" required />
      </td>
      <td className="px-3 py-2"></td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button form="new-material" type="submit" className="rounded bg-[#1cc88a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#17a674]">
          Agregar
        </button>
      </td>
    </tr>
  );
}

function MaterialsCalcTable({ materials }: { materials: Material[] }) {
  return (
    <div className="rounded border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-bold text-[#4e73df]">Materiales de la calculadora</h2>
        <p className="mt-1 text-xs text-gray-400">
          Precio de placa completa por material — de acá sale el costo por mm² que usa la calculadora.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-3 py-3">Nombre</th>
              <th className="px-3 py-3">Espesor (mm)</th>
              <th className="px-3 py-3">Ancho placa (mm)</th>
              <th className="px-3 py-3">Largo placa (mm)</th>
              <th className="px-3 py-3">Costo placa ($)</th>
              <th className="px-3 py-3 text-right">Costo/mm²</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <MaterialRow key={m.id} material={m} />
            ))}
            <tr className="border-t-2 border-gray-200 bg-gray-50/50">
              <td colSpan={7} className="px-3 py-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
                Agregar material
              </td>
            </tr>
            <NewMaterialRow />
          </tbody>
        </table>
      </div>

      {/* Forms reales, fuera de la tabla (ver nota en MaterialRow). Sin
          contenido propio: cada input/botón de las filas de arriba se
          asocia acá vía el atributo `form`. */}
      {materials.map((m) => (
        <form key={m.id} id={`material-${m.id}`} action={updateMaterialAction} />
      ))}
      <form id="new-material" action={createMaterialAction} />
    </div>
  );
}

export default async function MaterialesPage() {
  const alerts = getLowStockAlerts();
  const materials = await getMaterials();

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Materiales e insumos</h1>

      <div className="mb-6">
        <MaterialsCalcTable materials={materials} />
      </div>

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
