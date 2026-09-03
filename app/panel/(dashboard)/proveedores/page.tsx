import { getCombinedProducts } from "@/lib/catalog";
import { requireAuth } from "@/lib/panel-auth";
import ProveedoresBrowser from "@/components/panel/proveedores/ProveedoresBrowser";

// El catálogo se cachea en KV, pero igual necesita el binding real del
// Worker en tiempo de request — sin esto la página quedaría prerenderizada
// una vez en el build, sin poder leerlo.
export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  await requireAuth();
  const products = await getCombinedProducts();

  return (
    <>
      <h1 className="mb-2 text-xl font-bold text-gray-800">Proveedores</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Catálogo crudo de cada proveedor (CDO Promocionales y Maya Publicidad) — todos los datos que mandan sus
        APIs, no solo lo que se muestra en el sitio público. Click en un producto para ver la ficha completa.
      </p>
      <ProveedoresBrowser products={products} />
    </>
  );
}
