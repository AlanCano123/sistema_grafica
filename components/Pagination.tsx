import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string | null;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({ currentPage, totalPages, category }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (category) params.set("category", category);
    return `/?${params.toString()}`;
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-8 flex items-center justify-between">
      <Link
        href={prev ? buildHref(prev) : "#"}
        aria-disabled={!prev}
        className={`flex items-center gap-1 rounded-full border px-4 py-2 text-sm ${
          prev ? "border-black/10 text-black hover:bg-black/5" : "cursor-not-allowed border-black/5 text-black/20"
        }`}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Anterior</span>
      </Link>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-black/40">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                p === currentPage ? "bg-black text-white" : "text-black/60 hover:bg-black/5"
              }`}
            >
              {p}
            </Link>
          )
        )}
      </div>

      <Link
        href={next ? buildHref(next) : "#"}
        aria-disabled={!next}
        className={`flex items-center gap-1 rounded-full border px-4 py-2 text-sm ${
          next ? "border-black/10 text-black hover:bg-black/5" : "cursor-not-allowed border-black/5 text-black/20"
        }`}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
