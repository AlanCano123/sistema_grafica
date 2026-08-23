"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  ExternalLink,
  ClipboardList,
  Layers,
  PiggyBank,
  Users,
  Calculator,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/panel/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/panel/materiales", label: "Materiales", icon: Layers },
  { href: "/panel/cotizador", label: "Cotizador", icon: Calculator },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings },
  { href: "/panel/finanzas", label: "Finanzas", icon: PiggyBank },
  { href: "/panel/clientes", label: "Clientes", icon: Users },
  { href: "/panel/deudas", label: "Deudas", icon: Wallet },
  { href: "/panel/ventas", label: "Ventas", icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-56 shrink-0 flex-col text-white"
      style={{ background: "linear-gradient(180deg, #4e73df 10%, #224abe 100%)" }}
    >
      <Link
        href="/panel"
        className="flex items-center justify-center gap-2 border-b border-white/20 py-4 text-lg font-bold tracking-wide"
      >
        Sistema Gráfica
      </Link>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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
        className="flex items-center gap-2 border-t border-white/20 px-4 py-3 text-xs text-white/70 hover:text-white"
      >
        <ExternalLink size={14} />
        Ver sitio público
      </Link>
    </aside>
  );
}
