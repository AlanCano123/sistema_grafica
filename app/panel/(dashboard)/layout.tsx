import { Nunito } from "next/font/google";
import PanelChrome from "@/components/panel/PanelChrome";

// Misma tipografía que usa el template original (SB Admin 2).
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

// Login básico en /panel/login (fuera de este route group, sin este
// chrome) — ver proxy.ts y lib/panel-auth.ts. Sigue siendo un gate
// simple con credenciales hardcodeadas, no un sistema de usuarios real.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={nunito.className}>
      <PanelChrome>{children}</PanelChrome>
    </div>
  );
}
