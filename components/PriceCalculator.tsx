"use client";

import { useMemo, useState } from "react";
import { MATERIALS } from "@/lib/materials";
import { formatPrice } from "@/lib/product-helpers";

export default function PriceCalculator() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [materialId, setMaterialId] = useState(MATERIALS[0].id);

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];

  const result = useMemo(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return null;

    const areaM2 = (w * h) / 10000; // cm² a m²
    const cost = Math.max(areaM2 * material.pricePerM2, material.minCharge);
    return { areaM2, cost };
  }, [width, height, material]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-black/60">
            Ancho (cm)
            <input
              type="number"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Ej: 50"
              className="rounded-full border border-black/10 px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-black/60">
            Largo (cm)
            <input
              type="number"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ej: 100"
              className="rounded-full border border-black/10 px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm text-black/60">
          Material
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="rounded-full border border-black/10 px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none"
          >
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {formatPrice(m.pricePerM2)}/m²
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col justify-center rounded-[16px] bg-[#F0EEED] p-5">
        {result ? (
          <>
            <p className="text-sm text-black/50">Área: {result.areaM2.toFixed(2)} m²</p>
            <p className="mt-1 text-3xl font-bold text-black">{formatPrice(result.cost)}</p>
            <p className="mt-2 text-xs text-black/40">
              Costo aproximado (datos de prueba). No incluye impuestos ni terminaciones extra.
            </p>
          </>
        ) : (
          <p className="text-sm text-black/40">Ingresá ancho y largo para calcular.</p>
        )}
      </div>
    </div>
  );
}
