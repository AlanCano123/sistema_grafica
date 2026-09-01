import { getCombinedProducts } from "@/lib/catalog";
import { getDolarOficialVenta } from "@/lib/dolar";
import { getPricingSettings } from "@/lib/materials-db";
import { filterByCategory, getUniqueCategories, hasPlaceholderImage } from "@/lib/product-helpers";
import CatalogGrid from "@/components/CatalogGrid";
import Pagination from "@/components/Pagination";
import CategoryFilter from "@/components/CategoryFilter";

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const category = params.category ?? null;

  const [allProductsRaw, dolarVenta, settings] = await Promise.all([
    getCombinedProducts(),
    getDolarOficialVenta(),
    getPricingSettings(),
  ]);
  const catalogMultiplier = settings.catalog_multiplier;
  const allProducts = allProductsRaw.filter((p) => !hasPlaceholderImage(p));
  const categories = getUniqueCategories(allProducts);
  const filtered = filterByCategory(allProducts, category);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const products = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 xl:px-0">
        <header className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-red">NUESTROS PRODUCTOS</p>
          <h1 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">Catálogo</h1>
          <p className="text-sm text-neutral-400">{filtered.length} productos disponibles</p>
        </header>

        <div className="flex flex-col items-start gap-5 md:flex-row">
          <CategoryFilter categories={categories} activeCategory={category} />

          <div className="flex w-full flex-col space-y-5">
            {products.length === 0 ? (
              <p className="text-neutral-500">No se encontraron productos.</p>
            ) : (
              <CatalogGrid products={products} dolarVenta={dolarVenta} catalogMultiplier={catalogMultiplier} />
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} category={category} />
          </div>
        </div>
      </div>
    </main>
  );
}
