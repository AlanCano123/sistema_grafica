import Image from "next/image";
import { Product } from "@/lib/types";
import { getMainImage, getTotalStock } from "@/lib/product-helpers";

export default function ProductCard({ product }: { product: Product }) {
  const image = getMainImage(product);
  const stock = getTotalStock(product);
  const sinStock = stock <= 0;

  return (
    <div className="flex flex-col items-start">
      <div className="relative mb-2.5 aspect-square w-full overflow-hidden rounded-[13px] bg-[#F0EEED] lg:mb-4 lg:rounded-[20px]">
        <Image
          src={image}
          alt={product.name}
          fill
          quality={90}
          className="object-contain p-4 transition-transform duration-500 hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {sinStock && (
          <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white">
            Sin stock
          </span>
        )}
      </div>

      <span className="text-xs text-black/40">{product.code}</span>
      <h3 className="line-clamp-2 text-sm font-bold text-black">{product.name}</h3>

      {product.categories && product.categories.length > 0 && (
        <p className="mt-0.5 line-clamp-1 text-xs text-black/50">
          {product.categories.map((c) => c.name).join(", ")}
        </p>
      )}

      {product.description && (
        <p className="mt-1 line-clamp-3 text-xs text-black/60">{product.description}</p>
      )}

      <span className={`mt-2 text-xs font-medium ${sinStock ? "text-[#FF3333]" : "text-black/50"}`}>
        {sinStock ? "Agotado" : `Stock: ${stock}`}
      </span>
    </div>
  );
}
