import { requireAdmin } from "@/lib/panel-auth";
import { getPricingSettings } from "@/lib/materials-db";
import { getServicePhotosBySlug, photoUrl } from "@/lib/service-photos";
import { getGrabadosPricing } from "@/lib/site-content";
import { MAX_PHOTOS_PER_SERVICE, SERVICES } from "@/lib/services";
import ServicePhotoUploader from "@/components/panel/sitio/ServicePhotoUploader";
import {
  deleteServicePhotoAction,
  moveServicePhotoAction,
  updateGrabadosPricingAction,
  updateSiteSettingsAction,
} from "./actions";

// D1 + KV solo existen en tiempo real del Worker.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

export default async function SitioPage() {
  await requireAdmin();
  const [settings, photosBySlug, grabados] = await Promise.all([
    getPricingSettings(),
    getServicePhotosBySlug(),
    getGrabadosPricing(),
  ]);

  return (
    <>
      <h1 className="mb-2 text-xl font-bold text-gray-800">Sitio web</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Configuración y contenido del sitio público: multiplicador de precios del catálogo, calculadora, y las fotos
        del carrusel de cada servicio.
      </p>

      {/* --- Precios y calculadora del sitio --- */}
      <div className="mb-8 rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Precios y calculadora del sitio público</h2>
        <form action={updateSiteSettingsAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="text-xs text-gray-500">
            Multiplicador de precios del catálogo
            <input
              className={`mt-1 ${inputClass}`}
              name="catalog_multiplier"
              type="number"
              step="any"
              min="0.1"
              defaultValue={settings.catalog_multiplier}
              required
            />
            <span className="mt-1 block text-[11px] text-gray-400">
              Se aplica al precio de proveedor (CDO/Maya) en el catálogo. Hoy: ×{settings.catalog_multiplier}.
            </span>
          </label>
          <label className="text-xs text-gray-500">
            Minutos MO promedio (calculadora web)
            <input
              className={`mt-1 ${inputClass}`}
              name="avg_mo_minutes_web"
              type="number"
              step="any"
              min="0"
              defaultValue={settings.avg_mo_minutes_web}
              required
            />
            <span className="mt-1 block text-[11px] text-gray-400">
              Minutos de mano de obra que asume la calculadora pública de grabado.
            </span>
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded bg-[#4e73df] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d5cc4]">
              Guardar
            </button>
          </div>
        </form>
      </div>

      {/* --- Tarifas de grabado (sección "Grabados" del sitio) --- */}
      <div className="mb-8 rounded border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#4e73df]">Tarifas de grabado (sitio público)</h2>
        <form action={updateGrabadosPricingAction} className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <label className="text-xs text-gray-500">
                {i === 0 && "Nombre"}
                <input className={`mt-1 ${inputClass}`} name={`label_${i}`} defaultValue={grabados[i]?.label ?? ""} placeholder="Ej: Grabado común" />
              </label>
              <label className="text-xs text-gray-500">
                {i === 0 && "Precio (texto)"}
                <input className={`mt-1 ${inputClass}`} name={`price_${i}`} defaultValue={grabados[i]?.price ?? ""} placeholder="Ej: $5.000" />
              </label>
            </div>
          ))}
          <div>
            <button type="submit" className="rounded bg-[#4e73df] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d5cc4]">
              Guardar tarifas
            </button>
          </div>
        </form>
        <p className="mt-2 text-[11px] text-gray-400">
          Se muestran en la sección &quot;Grabados&quot; de la home. El precio es texto libre (escribilo como querés).
          Dejá el nombre vacío para ocultar una fila.
        </p>
      </div>

      {/* --- Fotos por servicio --- */}
      <div className="flex flex-col gap-4">
        {SERVICES.map((service) => {
          const photos = photosBySlug.get(service.slug) ?? [];
          return (
            <div key={service.slug} className="rounded border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{service.title}</h3>
                  <p className="text-xs text-gray-400">
                    {photos.length} / {MAX_PHOTOS_PER_SERVICE} fotos
                  </p>
                </div>
                <ServicePhotoUploader slug={service.slug} currentCount={photos.length} max={MAX_PHOTOS_PER_SERVICE} />
              </div>

              {photos.length === 0 ? (
                <p className="text-xs text-gray-400">Sin fotos. La tarjeta de este servicio no abre carrusel en el sitio.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {photos.map((p, i) => (
                    <div key={p.id} className="group relative overflow-hidden rounded border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrl(service.slug, p.id)} alt="" className="aspect-square w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                        <form action={moveServicePhotoAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="dir" value="up" />
                          <button type="submit" disabled={i === 0} className="px-1 text-xs font-bold text-white disabled:opacity-30">
                            ◀
                          </button>
                        </form>
                        <form action={deleteServicePhotoAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" className="px-1 text-xs font-bold text-[#ff6b6b]">
                            ✕
                          </button>
                        </form>
                        <form action={moveServicePhotoAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="dir" value="down" />
                          <button type="submit" disabled={i === photos.length - 1} className="px-1 text-xs font-bold text-white disabled:opacity-30">
                            ▶
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
