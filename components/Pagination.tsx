import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string | null;
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

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Link
        href={prev ? buildHref(prev) : "#"}
        aria-disabled={!prev}
        className={`rounded border px-4 py-2 text-sm ${
          prev ? "border-gray-300 hover:bg-gray-100" : "cursor-not-allowed border-gray-100 text-gray-300"
        }`}
      >
        ← Anterior
      </Link>

      <span className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>

      <Link
        href={next ? buildHref(next) : "#"}
        aria-disabled={!next}
        className={`rounded border px-4 py-2 text-sm ${
          next ? "border-gray-300 hover:bg-gray-100" : "cursor-not-allowed border-gray-100 text-gray-300"
        }`}
      >
        Siguiente →
      </Link>
    </div>
  );
}
