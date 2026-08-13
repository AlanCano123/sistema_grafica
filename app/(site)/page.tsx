import { getCombinedProducts } from "@/lib/catalog";
import { filterByCategory, getUniqueCategories } from "@/lib/product-helpers";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import CategoryFilter from "@/components/CategoryFilter";
import CalculatorToggle from "@/components/CalculatorToggle";

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const category = params.category ?? null;

  const allProducts = await getCombinedProducts();
  const categories = getUniqueCategories(allProducts);
  const filtered = filterByCategory(allProducts, category);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const products = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 xl:px-0">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-black md:text-[32px]">Catálogo</h1>
          <p className="text-sm text-black/50">{filtered.length} productos disponibles</p>
        </header>

        <CalculatorToggle />

        <div className="flex flex-col items-start gap-5 md:flex-row">
          <CategoryFilter categories={categories} activeCategory={category} />

          <div className="flex w-full flex-col space-y-5">
            {products.length === 0 ? (
              <p className="text-black/40">No se encontraron productos.</p>
            ) : (
              <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} category={category} />
          </div>
        </div>
      </div>
    </main>
  );
}
