import { computeMoRates } from "@/lib/materials";
import { getMaterials, getOperatingCosts, getPricingSettings } from "@/lib/materials-db";
import { SERVICE_TYPES } from "@/lib/service-types";
import { formatPrice } from "@/lib/product-helpers";
import StatCard from "@/components/StatCard";
import CotizadorForm from "@/components/panel/cotizador/CotizadorForm";
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
        Cargá los items del trabajo (material, medida, minutos). Desde acá creás el pedido directo o guardás un
        presupuesto.
      </p>

      {/* Valores de referencia usados en el cálculo — se editan en Configuración. */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Precio MO x Hora" value={formatPrice(rates.moPerHour)} accent="green" icon={Wallet} />
        <StatCard label="Precio MO x Minuto" value={formatPrice(rates.moPerMinute)} accent="green" icon={Timer} />
        <StatCard label="Margen mayorista" value={`${settings.wholesale_margin_pct}%`} accent="blue" icon={Percent} />
        <StatCard label="Margen minorista" value={`${settings.retail_margin_pct}%`} accent="blue" icon={Percent} />
      </div>

      <CotizadorForm
        materials={materials}
        moPerMinute={rates.moPerMinute}
        wholesalePct={settings.wholesale_margin_pct}
        retailPct={settings.retail_margin_pct}
        serviceTypes={SERVICE_TYPES}
      />
    </>
  );
}
