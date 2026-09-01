"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";

// Mismo patrón que components/panel/proveedores/ProveedoresBrowser.tsx:
// estado de selección acá arriba, ProductCard queda "tonto" (solo props),
// el modal se abre al clickear una tarjeta.
export default function CatalogGrid({
  products,
  dolarVenta,
  catalogMultiplier,
}: {
  products: Product[];
  dolarVenta: number | null;
  catalogMultiplier: number;
}) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => setSelected(product)}
            className="text-left"
            aria-label={`Ver detalle de ${product.name}`}
          >
            <ProductCard product={product} dolarVenta={dolarVenta} catalogMultiplier={catalogMultiplier} />
          </button>
        ))}
      </div>

      {selected && (
        <ProductDetailModal
          product={selected}
          dolarVenta={dolarVenta}
          catalogMultiplier={catalogMultiplier}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
