import { computeMoRates } from "@/lib/materials";
import { getMaterials, getOperatingCosts, getPricingSettings } from "@/lib/materials-db";
import Cotizador from "@/components/panel/Cotizador";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

export default async function CotizadorPage() {
  const [materials, settings, costs] = await Promise.all([getMaterials(), getPricingSettings(), getOperatingCosts()]);
  const rates = computeMoRates(settings, costs);

  return (
    <>
      <h1 className="mb-2 text-xl font-bold text-gray-800">Cotizador</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Cargá el material, la medida y los minutos de mano de obra reales del trabajo — reemplaza usar la planilla de
        costos a mano.
      </p>
      <Cotizador
        materials={materials}
        moPerMinute={rates.moPerMinute}
        wholesalePct={settings.wholesale_margin_pct}
        retailPct={settings.retail_margin_pct}
      />
    </>
  );
}
