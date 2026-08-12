// Next.js muestra esto automáticamente (streaming) mientras CatalogPage
// espera la respuesta de las APIs de CDO/Maya. Sin esto, el navegador
// queda con la pestaña en blanco todo lo que tarde el fetch más lento
// (la API de CDO puede tardar 30s+ en el peor caso).
export default function Loading() {
  const skeletonCards = Array.from({ length: 24 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {skeletonCards.map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="aspect-square w-full animate-pulse bg-gray-100" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
