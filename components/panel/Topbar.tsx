import { LogOut, Menu, Search, UserCircle } from "lucide-react";
import { logoutAction } from "@/app/panel/login/actions";

// Búsqueda decorativa por ahora (sin funcionalidad real todavía).
export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="p-1 text-gray-500 hover:text-gray-700 md:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="relative w-full max-w-xs">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          disabled
          className="w-full rounded border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-500 placeholder:text-gray-400"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3 text-sm text-gray-600">
        <span className="hidden items-center gap-2 sm:flex">
          <UserCircle size={22} className="text-gray-400" />
          Administrador
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#e74a3b]"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}
