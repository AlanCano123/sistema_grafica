import { Nunito } from "next/font/google";
import Sidebar from "@/components/panel/Sidebar";
import Topbar from "@/components/panel/Topbar";

// Misma tipografía que usa el template original (SB Admin 2).
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

// Sin auth todavía: cualquiera que entre a /panel ve los datos. Antes de
// cargar datos reales del negocio hay que cerrar esto (ver nota pendiente
// del chat).
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex min-h-screen bg-[#f8f9fc] ${nunito.className}`}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
