"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, getMainImage } from "@/lib/product-helpers";

const PROVIDER_LABEL: Record<string, string> = {
  cdo: "CDO Promocionales",
  maya: "Maya Publicidad",
};

export default function ProductFichaModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const provider = product.provider ? (PROVIDER_LABEL[product.provider] ?? product.provider) : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <span className="rounded-full bg-[#4e73df]/10 px-2 py-0.5 text-xs font-bold text-[#4e73df]">{provider}</span>
            <h2 className="mt-1 text-lg font-bold text-gray-800">{product.name}</h2>
            <p className="text-xs text-gray-400">Código: {product.code}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[200px_1fr]">
          <div className="relative h-48 w-full overflow-hidden rounded border border-gray-100 bg-gray-50 md:h-full">
            <Image src={getMainImage(product)} alt={product.name} fill sizes="200px" className="object-contain" unoptimized />
          </div>

          <div>
            {product.description && <p className="mb-3 text-sm text-gray-600">{product.description}</p>}

            {product.categories && product.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {product.categories.map((c) => (
                  <span key={c.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {product.packing && (
              <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-3">
                {product.packing.width && <span>Ancho: {product.packing.width}</span>}
                {product.packing.height && <span>Alto: {product.packing.height}</span>}
                {product.packing.depth && <span>Profundidad: {product.packing.depth}</span>}
                {product.packing.volume && <span>Volumen: {product.packing.volume}</span>}
                {product.packing.weight && <span>Peso: {product.packing.weight}</span>}
                {product.packing.quantity !== null && product.packing.quantity !== undefined && (
                  <span>Cant. bulto: {product.packing.quantity}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <h3 className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
            Variantes ({product.variants.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Color</th>
                  <th className="px-3 py-2 text-right">Stock disp.</th>
                  <th className="px-3 py-2 text-right">Stock exist.</th>
                  <th className="px-3 py-2 text-right">Precio lista</th>
                  <th className="px-3 py-2 text-right">Precio neto</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {v.sku}
                      {v.novedad && (
                        <span className="ml-1.5 rounded-full bg-[#1cc88a]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#1cc88a]">
                          Novedad
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {v.color ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-3 w-3 shrink-0 rounded-full border border-gray-200"
                            style={{ backgroundColor: v.color.hex_code || "#ccc" }}
                          />
                          {v.color.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">{v.stock_available}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{v.stock_existent}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{formatPrice(parseFloat(v.list_price) || 0)}</td>
                    <td className="px-3 py-2 text-right font-bold text-gray-800">
                      {formatPrice(parseFloat(v.net_price) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
