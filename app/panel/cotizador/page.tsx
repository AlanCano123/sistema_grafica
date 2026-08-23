import { computeMoRates } from "@/lib/materials";
import { getMaterials, getOperatingCosts, getPricingSettings } from "@/lib/materials-db";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import Cotizador from "@/components/panel/Cotizador";
import { Percent, Timer, Wallet } from "lucide-react";

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

      {/* Valores de referencia usados en el cálculo — se editan en
          Configuración, acá solo se muestran para no tener que ir y volver
          mientras se cotiza (mismo criterio que el Excel, que los tiene
          siempre a la vista arriba de la tabla de precios). */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Precio MO x Hora" value={formatPrice(rates.moPerHour)} accent="green" icon={Wallet} />
        <StatCard label="Precio MO x Minuto" value={formatPrice(rates.moPerMinute)} accent="green" icon={Timer} />
        <StatCard label="Margen mayorista" value={`${settings.wholesale_margin_pct}%`} accent="blue" icon={Percent} />
        <StatCard label="Margen minorista" value={`${settings.retail_margin_pct}%`} accent="blue" icon={Percent} />
      </div>

      <Cotizador
        materials={materials}
        moPerMinute={rates.moPerMinute}
        wholesalePct={settings.wholesale_margin_pct}
        retailPct={settings.retail_margin_pct}
      />
    </>
  );
}
