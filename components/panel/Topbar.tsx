import { Search, UserCircle } from "lucide-react";

// Búsqueda decorativa por ahora (sin funcionalidad real todavía) y usuario
// placeholder — no hay auth implementada, ver nota en app/panel/layout.tsx.
export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="relative w-full max-w-xs">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          disabled
          className="w-full rounded border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-500 placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <UserCircle size={22} className="text-gray-400" />
        Administrador
      </div>
    </header>
  );
}
