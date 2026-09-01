"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_ONLY_PATHS, USER_HOME_PATH, type Role } from "@/lib/panel-roles";
import {
  LayoutDashboard,
  Wallet,
  ExternalLink,
  ClipboardList,
  Layers,
  PiggyBank,
  Calculator,
  Settings,
  Truck,
  FileText,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboard },
  { href: "/panel/cotizador", label: "Cotizador", icon: Calculator },
  { href: "/panel/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/panel/materiales", label: "Materiales", icon: Layers },
  { href: "/panel/proveedores", label: "Proveedores", icon: Truck },
  { href: "/panel/presupuestos", label: "Presupuestos", icon: FileText },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings },
  { href: "/panel/finanzas", label: "Finanzas", icon: PiggyBank },
  { href: "/panel/deudas", label: "Movimientos", icon: Wallet },
];

// Abajo de "md" es un drawer off-canvas (PanelChrome maneja el estado
// `open` y el backdrop); en "md" para arriba queda fijo como siempre.
export default function Sidebar({ role, open, onNavigate }: { role: Role; open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  // "usuario" no ve los links de las secciones admin-only — la
  // restricción real (por si entra a la URL a mano) la hace
  // requireAdmin() en cada page.tsx, esto es solo no ofrecer el link.
  const items = role === "admin" ? NAV_ITEMS : NAV_ITEMS.filter((item) => !ADMIN_ONLY_PATHS.includes(item.href));
  const homeHref = role === "admin" ? "/panel" : USER_HOME_PATH;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col text-white transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ background: "linear-gradient(180deg, #4e73df 10%, #224abe 100%)" }}
    >
      <Link
        href={homeHref}
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 border-b border-white/20 py-4 text-lg font-bold tracking-wide"
      >
        Sistema Gráfica
      </Link>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2 border-t border-white/20 px-4 py-3 text-xs text-white/70 hover:text-white"
      >
        <ExternalLink size={14} />
        Ver sitio público
      </Link>
    </aside>
  );
}
