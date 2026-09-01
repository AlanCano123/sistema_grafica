"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, getEstimatedPriceRange, getMainImage, getTotalStock, toSentenceCase } from "@/lib/product-helpers";
import { useCart } from "@/lib/cart-context";

// Ficha de producto del catálogo público — mismo concepto que
// components/panel/proveedores/ProductFichaModal.tsx, pero con el tema
// oscuro del sitio (ese es panel, SB-Admin-2 claro) y con "Agregar al
// carrito" en vez de la tabla de variantes/stock interna de proveedores.
export default function ProductDetailModal({
  product,
  dolarVenta,
  catalogMultiplier,
  onClose,
}: {
  product: Product;
  dolarVenta: number | null;
  catalogMultiplier: number;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const stock = getTotalStock(product);
  const sinStock = stock <= 0;
  const priceRange = getEstimatedPriceRange(product, dolarVenta, catalogMultiplier);

  function handleAdd() {
    add({
      key: `${product.provider}:${product.code}`,
      name: product.name,
      code: product.code,
      image: getMainImage(product),
      priceMin: priceRange?.min ?? null,
      priceMax: priceRange?.max ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-neutral-950/95 px-5 py-4 backdrop-blur">
          <div>
            <span className="text-xs text-neutral-500">Código: {product.code}</span>
            <h2 className="text-lg font-bold text-white">{product.name}</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white" aria-label="Cerrar">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[220px_1fr]">
          {/* Fondo blanco, mismo criterio que el catálogo y Proveedores. */}
          <div className="relative h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-white sm:h-full">
            <Image src={getMainImage(product)} alt={product.name} fill sizes="220px" className="object-contain p-3" unoptimized />
          </div>

          <div className="flex flex-col">
            {product.description && <p className="mb-3 text-sm text-neutral-300">{product.description}</p>}

            {product.categories && product.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {product.categories.map((c) => (
                  <span key={c.id} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-neutral-400">
                    {toSentenceCase(c.name)}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto">
              <div className="mb-1 text-xl font-bold text-brand-red">
                {priceRange
                  ? priceRange.min === priceRange.max
                    ? formatPrice(priceRange.min)
                    : `${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}`
                  : "Precio a consultar"}
              </div>
              {priceRange && <p className="mb-3 text-xs text-neutral-500">Precio estimado, sujeto a modificación — no es precio final.</p>}

              <p className={`mb-4 text-xs font-medium ${sinStock ? "text-brand-red" : "text-neutral-400"}`}>
                {sinStock ? "Sin stock" : `Stock disponible: ${stock}`}
              </p>

              <button
                type="button"
                onClick={handleAdd}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
              >
                {added ? (
                  <>
                    <Check size={16} /> Agregado
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> Agregar al carrito
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
