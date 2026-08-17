"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Clock, MessageSquare } from "lucide-react";
import { MATERIALS, calculatePrice } from "@/lib/materials";
import { formatPrice } from "@/lib/product-helpers";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Materiales de calidad" },
  { icon: Clock, label: "Entrega en tiempo" },
  { icon: MessageSquare, label: "Atención personalizada" },
];

export default function PriceCalculator() {
  const [largo, setLargo] = useState("");
  const [ancho, setAncho] = useState("");
  const [materialId, setMaterialId] = useState(MATERIALS[0].id);

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];

  const price = useMemo(() => {
    return calculatePrice(parseFloat(largo), parseFloat(ancho), materialId);
  }, [largo, ancho, materialId]);

  const whatsappHref = price
    ? buildWhatsAppUrl(
        `Hola! Quiero pedir un presupuesto en Láser Kind. Medidas: ${largo}x${ancho}cm en ${material.label}. Precio estimado: ${formatPrice(price)}.`
      )
    : buildWhatsAppUrl();

  return (
    <section id="calculadora" className="border-b border-white/5 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div data-aos="fade-right">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-red">CALCULÁ TU TRABAJO</p>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Obtené tu presupuesto
              <br />
              <span className="text-brand-red">al instante</span>
            </h2>
            <p className="mb-8 max-w-md text-neutral-400">
              Ingresá las medidas y seleccioná el material. Te damos un precio estimado en segundos.
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="calc-largo" className="mb-1.5 block text-sm text-neutral-400">
                  Largo (cm)
                </label>
                <input
                  id="calc-largo"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej: 20"
                  value={largo}
                  onChange={(e) => setLargo(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-brand-red focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="calc-ancho" className="mb-1.5 block text-sm text-neutral-400">
                  Ancho (cm)
                </label>
                <input
                  id="calc-ancho"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej: 15"
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="calc-material" className="mb-1.5 block text-sm text-neutral-400">
                Material
              </label>
              <select
                id="calc-material"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-3 text-white focus:border-brand-red focus:outline-none"
              >
                {MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-red-dark"
            >
              Calcular presupuesto
            </a>
          </div>

          <div
            data-aos="fade-left"
            data-aos-delay="100"
            className="rounded-2xl border border-white/10 bg-neutral-900/40 p-8 md:p-10"
          >
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-red">PRECIO ESTIMADO</p>
            <p className="mb-4 text-5xl font-extrabold text-emerald-400">{price ? formatPrice(price) : "$ 0"}</p>
            <p className="mb-8 text-sm text-neutral-500">
              El precio mostrado es orientativo. El presupuesto final puede variar según diseño, material y
              cantidad.
            </p>

            <div className="grid gap-4 border-t border-white/10 pt-6">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-brand-red" strokeWidth={1.8} />
                  <span className="text-sm text-neutral-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
