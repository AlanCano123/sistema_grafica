"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Category } from "@/lib/types";
import { toSentenceCase } from "@/lib/product-helpers";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const [query, setQuery] = useState("");

  if (categories.length === 0) return null;

  const filtered = categories.filter((c) => toSentenceCase(c.name).toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="w-full space-y-4 rounded-[20px] border border-white/10 px-5 py-5 md:w-[260px] md:shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-white">Categorías</span>
        <SlidersHorizontal size={18} className="text-neutral-500" />
      </div>

      <div className="relative">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 pr-3 pl-8 text-sm text-white placeholder:text-neutral-500 focus:border-brand-red/50 focus:outline-none"
        />
      </div>

      <hr className="border-t-white/10" />

      <div className="flex max-h-[480px] flex-col space-y-0.5 overflow-y-auto pr-1 text-neutral-400">
        {!query && (
          <Link
            href="/catalogo"
            className={`flex items-center justify-between py-2 text-sm ${
              !activeCategory ? "font-bold text-white" : "hover:text-white"
            }`}
          >
            Todas
            {!activeCategory && <ChevronRight size={16} className="text-brand-red" />}
          </Link>
        )}

        {filtered.length === 0 ? (
          <p className="py-2 text-sm text-neutral-600">Sin resultados.</p>
        ) : (
          filtered.map((category) => {
            const isActive = activeCategory === String(category.id);
            return (
              <Link
                key={category.id}
                href={`/catalogo?category=${category.id}`}
                className={`flex items-center justify-between py-2 text-sm ${
                  isActive ? "font-bold text-white" : "hover:text-white"
                }`}
              >
                {toSentenceCase(category.name)}
                {isActive && <ChevronRight size={16} className="text-brand-red" />}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
