import { getCombinedProducts } from "@/lib/catalog";
import { filterByCategory, getUniqueCategories } from "@/lib/product-helpers";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import CategoryFilter from "@/components/CategoryFilter";

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
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>
        <p className="text-sm text-gray-500">{filtered.length} productos disponibles</p>
      </header>

      <CategoryFilter categories={categories} activeCategory={category} />

      {products.length === 0 ? (
        <p className="text-gray-500">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} category={category} />
    </main>
  );
}
