// Next.js muestra esto automáticamente (streaming) mientras CatalogoPage
// espera la respuesta de las APIs de CDO/Maya. Sin esto, el navegador
// queda con la pestaña en blanco todo lo que tarde el fetch más lento
// (la API de CDO puede tardar 30s+ en el peor caso).
export default function Loading() {
  const skeletonCards = Array.from({ length: 24 });

  return (
    <main className="pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 xl:px-0">
        <header className="mb-8 flex flex-col items-center gap-2">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-56 animate-pulse rounded bg-white/5" />
        </header>

        <div className="flex flex-col items-start gap-5 md:flex-row">
          <div className="h-96 w-full animate-pulse rounded-[20px] bg-white/5 md:w-[260px] md:shrink-0" />

          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {skeletonCards.map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <div className="aspect-square w-full animate-pulse rounded-[20px] bg-white/5" />
                <div className="h-3 w-12 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
