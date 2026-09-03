import type { GrabadoTier } from "@/lib/site-content";

export default function GrabadosPricing({ items }: { items: GrabadoTier[] }) {
  return (
    <section id="grabados" className="border-b border-white/5 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center" data-aos="fade-up">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-red">TARIFAS DE REFERENCIA</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Grabados
            <span className="mx-auto mt-4 block h-1 w-14 rounded-full bg-brand-red" />
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10" data-aos="fade-up">
          {items.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className={`flex items-center justify-between px-6 py-4 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${
                i > 0 ? "border-t border-white/5" : ""
              }`}
            >
              <span className="font-medium text-white">{item.label}</span>
              <span className="text-lg font-bold text-brand-red">{item.price}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          * Precios aproximados — pueden variar según tamaño, material y complejidad del trabajo. Consultanos para un
          presupuesto exacto.
        </p>
      </div>
    </section>
  );
}
