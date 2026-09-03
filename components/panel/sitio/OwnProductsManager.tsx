"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  MAX_PHOTOS_PER_PRODUCT,
  ownPhotoUrl,
  ownProductCode,
  type OwnProduct,
  type OwnProductPhoto,
} from "@/lib/own-products";
import { formatPrice } from "@/lib/product-helpers";
import PhotoUploader from "@/components/panel/PhotoUploader";
import {
  createOwnProductAction,
  deleteOwnProductAction,
  deleteOwnProductPhotoAction,
  moveOwnProductPhotoAction,
  updateOwnProductAction,
  uploadOwnProductPhotosAction,
} from "@/app/panel/(dashboard)/sitio/actions";

const inputClass =
  "w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none";

export default function OwnProductsManager({
  products,
  photos,
}: {
  products: OwnProduct[];
  photos: Record<number, OwnProductPhoto[]>;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-sm font-bold text-[#4e73df]">Productos propios</h2>
      <p className="mb-4 text-xs text-gray-400">
        Se muestran en el catálogo público junto a los de los proveedores — el cliente no ve que son nuestros. El
        precio es final en pesos (no lleva el multiplicador del catálogo).
      </p>

      {/* Nuevo producto */}
      {creating ? (
        <form
          action={createOwnProductAction}
          className="mb-4 rounded border border-[#1cc88a]/40 bg-[#1cc88a]/5 p-4"
        >
          <ProductFields />
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded bg-[#1cc88a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17a674]">
              Crear producto
            </button>
            <button type="button" onClick={() => setCreating(false)} className="rounded px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Creá el producto y después subís las fotos.</p>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mb-4 flex items-center gap-1 rounded bg-[#1cc88a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#17a674]"
        >
          <Plus size={14} /> Agregar producto
        </button>
      )}

      {products.length === 0 ? (
        <p className="text-xs text-gray-400">Todavía no cargaste productos propios.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <ProductCard key={JSON.stringify(p)} product={p} productPhotos={photos[p.id] ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductFields({ product }: { product?: OwnProduct }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <label className="text-xs text-gray-500 md:col-span-2">
        Nombre
        <input className={`mt-1 ${inputClass}`} name="name" defaultValue={product?.name ?? ""} required placeholder="Ej: Taza mágica personalizada" />
      </label>
      <label className="text-xs text-gray-500">
        Precio ($)
        <input className={`mt-1 ${inputClass}`} name="price" type="number" step="any" min="0" defaultValue={product?.price ?? ""} required />
      </label>
      <label className="text-xs text-gray-500">
        Categoría
        <input className={`mt-1 ${inputClass}`} name="category" defaultValue={product?.category ?? ""} placeholder="Ej: Souvenirs" />
      </label>
      <label className="text-xs text-gray-500">
        Stock
        <input className={`mt-1 ${inputClass}`} name="stock" type="number" step="1" min="0" defaultValue={product?.stock ?? 0} />
      </label>
      <label className="text-xs text-gray-500">
        Código
        <input className={`mt-1 ${inputClass}`} name="code" defaultValue={product?.code ?? ""} placeholder="Opcional" />
      </label>
      <label className="text-xs text-gray-500 md:col-span-3">
        Descripción
        <input className={`mt-1 ${inputClass}`} name="description" defaultValue={product?.description ?? ""} placeholder="Opcional" />
      </label>
      <label className="flex items-center gap-2 text-xs text-gray-500">
        <input type="checkbox" name="active" value="1" defaultChecked={product ? product.active === 1 : true} className="h-4 w-4" />
        Activo (visible en el sitio)
      </label>
    </div>
  );
}

function ProductCard({ product, productPhotos }: { product: OwnProduct; productPhotos: OwnProductPhoto[] }) {
  return (
    <details className="rounded border border-gray-200">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-medium text-gray-800">
          {product.name}
          {product.active === 0 && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">Oculto</span>}
        </span>
        <span className="flex items-center gap-3 text-xs text-gray-400">
          <span>{productPhotos.length} foto(s)</span>
          <span>stock {product.stock}</span>
          <span className="font-bold text-gray-700">{formatPrice(product.price)}</span>
        </span>
      </summary>

      <div className="border-t border-gray-100 p-4">
        <form action={updateOwnProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <ProductFields product={product} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="submit" className="rounded bg-[#4e73df] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d5cc4]">
              Guardar
            </button>
            <button
              type="submit"
              formAction={deleteOwnProductAction}
              className="rounded bg-[#e74a3b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c8392c]"
            >
              Borrar producto
            </button>
            <span className="text-[11px] text-gray-400">Código visible: {ownProductCode(product)}</span>
          </div>
        </form>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">
              Fotos ({productPhotos.length} / {MAX_PHOTOS_PER_PRODUCT})
            </p>
            <PhotoUploader
              idField="product_id"
              idValue={String(product.id)}
              currentCount={productPhotos.length}
              max={MAX_PHOTOS_PER_PRODUCT}
              uploadAction={uploadOwnProductPhotosAction}
            />
          </div>
          {productPhotos.length === 0 ? (
            <p className="text-xs text-gray-400">Sin fotos. En el catálogo se ve con un placeholder.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {productPhotos.map((ph, i) => (
                <div key={ph.id} className="group relative overflow-hidden rounded border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ownPhotoUrl(product.id, ph.id)} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                    <form action={moveOwnProductPhotoAction}>
                      <input type="hidden" name="id" value={ph.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button type="submit" disabled={i === 0} className="px-1 text-xs font-bold text-white disabled:opacity-30">
                        ◀
                      </button>
                    </form>
                    <form action={deleteOwnProductPhotoAction}>
                      <input type="hidden" name="id" value={ph.id} />
                      <button type="submit" className="px-1 text-xs font-bold text-[#ff6b6b]">
                        ✕
                      </button>
                    </form>
                    <form action={moveOwnProductPhotoAction}>
                      <input type="hidden" name="id" value={ph.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button type="submit" disabled={i === productPhotos.length - 1} className="px-1 text-xs font-bold text-white disabled:opacity-30">
                        ▶
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
