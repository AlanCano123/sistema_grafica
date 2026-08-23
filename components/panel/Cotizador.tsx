"use client";

import { useMemo, useState } from "react";
import { calculatePrice, type Material } from "@/lib/materials";
import { formatPrice } from "@/lib/product-helpers";

const inputClass =
  "w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

export default function Cotizador({
  materials,
  moPerMinute,
  wholesalePct,
  retailPct,
}: {
  materials: Material[];
  moPerMinute: number;
  wholesalePct: number;
  retailPct: number;
}) {
  const [materialId, setMaterialId] = useState<number>(materials[0]?.id ?? 0);
  const [ancho, setAncho] = useState("");
  const [largo, setLargo] = useState("");
  const [minutos, setMinutos] = useState("");

  const material = materials.find((m) => m.id === materialId);

  const result = useMemo(() => {
    if (!material) return null;
    return calculatePrice(
      parseFloat(ancho),
      parseFloat(largo),
      parseFloat(minutos) || 0,
      material,
      moPerMinute,
      wholesalePct,
      retailPct
    );
  }, [ancho, largo, minutos, material, moPerMinute, wholesalePct, retailPct]);

  if (materials.length === 0) {
    return (
      <div className="rounded border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
        No hay materiales cargados todavía. Agregá alguno en{" "}
        <a href="/panel/materiales" className="text-[#4e73df] underline">
          Materiales
        </a>
        .
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Datos del trabajo</h2>
        <div className="flex flex-col gap-4">
          <label className="text-xs text-gray-500">
            Material
            <select
              className={`mt-1 ${inputClass}`}
              value={materialId}
              onChange={(e) => setMaterialId(Number(e.target.value))}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs text-gray-500">
              Ancho (mm)
              <input
                className={`mt-1 ${inputClass}`}
                type="number"
                step="any"
                min="0"
                placeholder="Ej: 300"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
              />
            </label>
            <label className="text-xs text-gray-500">
              Largo (mm)
              <input
                className={`mt-1 ${inputClass}`}
                type="number"
                step="any"
                min="0"
                placeholder="Ej: 300"
                value={largo}
                onChange={(e) => setLargo(e.target.value)}
              />
            </label>
          </div>
          <label className="text-xs text-gray-500">
            Minutos de mano de obra
            <input
              className={`mt-1 ${inputClass}`}
              type="number"
              step="any"
              min="0"
              placeholder="Ej: 2"
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Desglose</h2>
        {result ? (
          <dl className="divide-y divide-gray-100 text-sm">
            <Row label="Costo material" value={formatPrice(result.materialCost)} />
            <Row label="Costo mano de obra" value={formatPrice(result.laborCost)} />
            <Row label="Costo final" value={formatPrice(result.finalCost)} bold />
            <Row label="Margen mayorista" value={formatPrice(result.wholesaleMargin)} />
            <Row label="Precio mayorista" value={formatPrice(result.wholesalePrice)} accent="blue" />
            <Row label="Margen minorista" value={formatPrice(result.retailMargin)} />
            <Row label="Precio minorista" value={formatPrice(result.retailPrice)} accent="green" />
          </dl>
        ) : (
          <p className="text-sm text-gray-400">Cargá ancho y largo para ver el cálculo.</p>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: "blue" | "green";
}) {
  const accentClass = accent === "blue" ? "text-[#4e73df]" : accent === "green" ? "text-[#1cc88a]" : "text-gray-800";
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`${bold ? "font-bold" : "font-medium"} ${accentClass}`}>{value}</dd>
    </div>
  );
}
