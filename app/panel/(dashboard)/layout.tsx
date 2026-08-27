import { Nunito } from "next/font/google";
import PanelChrome from "@/components/panel/PanelChrome";
import { requireAuth } from "@/lib/panel-auth";

// Misma tipografía que usa el template original (SB Admin 2).
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

// Login básico en /panel/login (fuera de este route group, sin este
// chrome) — ver middleware.ts y lib/panel-auth.ts. requireAuth() es la
// verificación DE VERDAD (firma + vencimiento de la cookie, con rol) —
// middleware.ts solo filtra anónimos antes de esto.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireAuth();

  return (
    <div className={nunito.className}>
      <PanelChrome role={role}>{children}</PanelChrome>
    </div>
  );
}
