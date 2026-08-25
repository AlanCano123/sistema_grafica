import { buildWhatsAppUrl } from "@/lib/whatsapp";
import BrandLogo from "./BrandLogo";

// Botón flotante grande, esquina inferior derecha, en todo el sitio
// público (se monta en app/(site)/layout.tsx, no en /panel). El logo real
// va en public/images/whatsapp-logo.png — ver BrandIcons.tsx para el
// resto de los usos que también lo necesitan (Header/Footer).
export default function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] p-3 shadow-lg shadow-black/40 transition-transform hover:scale-105 md:right-8 md:bottom-8 md:h-20 md:w-20"
    >
      <BrandLogo brand="whatsapp" size={48} className="h-full w-full object-contain" />
    </a>
  );
}
