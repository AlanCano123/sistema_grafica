import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import Gallery from "@/components/site/Gallery";
import PriceCalculator from "@/components/PriceCalculator";
import { computeMoRates } from "@/lib/materials";
import { getMaterials, getOperatingCosts, getPricingSettings } from "@/lib/materials-db";

// D1 solo existe en tiempo real del Worker (materiales + configuración de
// precios para la calculadora) — sin esto la página quedaría prerenderizada
// una vez en el build, sin poder leerlos.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [materials, settings, costs] = await Promise.all([getMaterials(), getPricingSettings(), getOperatingCosts()]);
  const rates = computeMoRates(settings, costs);

  return (
    <main>
      <Hero />
      <Services />
      <Gallery />
      <PriceCalculator
        materials={materials}
        moMinutes={settings.avg_mo_minutes_web}
        moPerMinute={rates.moPerMinute}
        retailPct={settings.retail_margin_pct}
      />
    </main>
  );
}
