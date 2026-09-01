import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import GrabadosPricing from "@/components/site/GrabadosPricing";
import Gallery from "@/components/site/Gallery";
import PriceCalculator from "@/components/PriceCalculator";
import { computeMoRates } from "@/lib/materials";
import { getMaterials, getOperatingCosts, getPricingSettings } from "@/lib/materials-db";
import { getServicePhotosBySlug } from "@/lib/service-photos";

// D1 solo existe en tiempo real del Worker (materiales + configuración de
// precios para la calculadora, fotos de servicios) — sin esto la página
// quedaría prerenderizada una vez en el build, sin poder leerlos.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [materials, settings, costs, photosBySlug] = await Promise.all([
    getMaterials(),
    getPricingSettings(),
    getOperatingCosts(),
    getServicePhotosBySlug(),
  ]);
  const rates = computeMoRates(settings, costs);

  const photoIdsBySlug: Record<string, number[]> = {};
  for (const [slug, photos] of photosBySlug) {
    photoIdsBySlug[slug] = photos.map((p) => p.id);
  }

  return (
    <main>
      <Hero />
      <Services photoIdsBySlug={photoIdsBySlug} />
      <GrabadosPricing />
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
