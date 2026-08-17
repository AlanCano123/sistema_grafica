import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { Category } from "@/lib/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="w-full space-y-4 rounded-[20px] border border-white/10 px-5 py-5 md:w-[260px] md:shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-white">Categorías</span>
        <SlidersHorizontal size={18} className="text-neutral-500" />
      </div>

      <hr className="border-t-white/10" />

      <div className="flex max-h-[480px] flex-col space-y-0.5 overflow-y-auto pr-1 text-neutral-400">
        <Link
          href="/catalogo"
          className={`flex items-center justify-between py-2 text-sm ${
            !activeCategory ? "font-bold text-white" : "hover:text-white"
          }`}
        >
          Todas
          {!activeCategory && <ChevronRight size={16} className="text-brand-red" />}
        </Link>

        {categories.map((category) => {
          const isActive = activeCategory === String(category.id);
          return (
            <Link
              key={category.id}
              href={`/catalogo?category=${category.id}`}
              className={`flex items-center justify-between py-2 text-sm ${
                isActive ? "font-bold text-white" : "hover:text-white"
              }`}
            >
              {category.name}
              {isActive && <ChevronRight size={16} className="text-brand-red" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
