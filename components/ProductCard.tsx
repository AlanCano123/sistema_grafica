import Image from "next/image";
import { Product } from "@/lib/types";
import { getMainImage, getPriceRange, getTotalStock, formatPrice } from "@/lib/product-helpers";

export default function ProductCard({ product }: { product: Product }) {
  const image = getMainImage(product);
  const { min, max } = getPriceRange(product);
  const stock = getTotalStock(product);
  const sinStock = stock <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {sinStock && (
          <span className="absolute top-2 right-2 rounded bg-gray-800/80 px-2 py-1 text-xs font-medium text-white">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs text-gray-400">{product.code}</span>
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</h3>

        {product.categories && product.categories.length > 0 && (
          <p className="text-xs text-gray-500">
            {product.categories.map((c) => c.name).join(", ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-gray-900">
            {min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`}
          </span>
          <span className={`text-xs ${sinStock ? "text-red-500" : "text-green-600"}`}>
            {sinStock ? "Agotado" : `Stock: ${stock}`}
          </span>
        </div>
      </div>
    </div>
  );
}
