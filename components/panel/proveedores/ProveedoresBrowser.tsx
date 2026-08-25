"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice, getMainImage, getPriceRange, getTotalStock } from "@/lib/product-helpers";
import ProductFichaModal from "./ProductFichaModal";

const PAGE_SIZE = 24;

type ProviderFilter = "all" | "cdo" | "maya";

const PROVIDER_LABEL: Record<string, string> = {
  cdo: "CDO Promocionales",
  maya: "Maya Publicidad",
};

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const { min, max } = getPriceRange(product);
  const stock = getTotalStock(product);
  const provider = product.provider ?? "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded border border-gray-100 bg-white text-left shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-32 w-full bg-gray-50">
        <Image src={getMainImage(product)} alt={product.name} fill sizes="200px" className="object-contain" unoptimized />
        <span className="absolute top-1.5 left-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#4e73df] shadow-sm">
          {PROVIDER_LABEL[provider] ?? provider ?? "—"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-semibold text-gray-800">{product.name}</p>
        <p className="text-[10px] text-gray-400">Código: {product.code}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-gray-700">{min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`}</span>
          <span className={`text-[10px] font-semibold ${stock > 0 ? "text-[#1cc88a]" : "text-[#e74a3b]"}`}>
            {stock > 0 ? `${stock} en stock` : "Sin stock"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function ProveedoresBrowser({ products }: { products: Product[] }) {
  const [provider, setProvider] = useState<ProviderFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Product | null>(null);

  const counts = useMemo(
    () => ({
      all: products.length,
      cdo: products.filter((p) => p.provider === "cdo").length,
      maya: products.filter((p) => p.provider === "maya").length,
    }),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (provider !== "all") list = list.filter((p) => p.provider === provider);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    return list;
  }, [products, provider, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeProvider(p: ProviderFilter) {
    setProvider(p);
    setPage(1);
  }

  const TABS: { value: ProviderFilter; label: string }[] = [
    { value: "all", label: `Todos (${counts.all})` },
    { value: "cdo", label: `CDO Promocionales (${counts.cdo})` },
    { value: "maya", label: `Maya Publicidad (${counts.maya})` },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => changeProvider(t.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                provider === t.value ? "bg-[#4e73df] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o código..."
          className="w-full max-w-xs rounded border border-gray-200 px-3 py-1.5 text-sm focus:border-[#4e73df] focus:outline-none"
        />
      </div>

      {pageItems.length === 0 ? (
        <p className="rounded border border-gray-100 bg-white py-10 text-center text-sm text-gray-400 shadow-sm">
          No hay productos que coincidan.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {pageItems.map((p) => (
            <ProductCard key={`${p.provider}-${p.id}`} product={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {selected && <ProductFichaModal product={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
