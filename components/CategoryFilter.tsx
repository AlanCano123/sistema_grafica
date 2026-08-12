import Link from "next/link";
import { Category } from "@/lib/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Link
        href="/"
        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
          !activeCategory
            ? "border-gray-900 bg-gray-900 text-white"
            : "border-gray-300 text-gray-600 hover:bg-gray-100"
        }`}
      >
        Todas
      </Link>

      {categories.map((category) => {
        const isActive = activeCategory === String(category.id);
        return (
          <Link
            key={category.id}
            href={`/?category=${category.id}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isActive
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
