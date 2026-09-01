import { Sparkles, Printer, Shirt, PenTool, Scissors, Building2, Gift, Briefcase, Trophy, Signpost, type LucideIcon } from "lucide-react";

// Servicios del sitio público (sección "¿Qué hacemos?"). Fuente única:
// la usan `components/site/Services.tsx` para mostrarlos y `/panel/sitio`
// para administrar las fotos de cada uno (el `slug` es la clave que
// matchea las fotos).
export interface Service {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const SERVICES: Service[] = [
  { slug: "grabado-laser", title: "Grabado Láser", description: "Grabados sobre madera, MDF, acrílico, metal, cuero, vidrio y más.", icon: Sparkles },
  { slug: "impresion-uv", title: "Impresión UV", description: "Impresión directa a todo color sobre diferentes superficies.", icon: Printer },
  { slug: "dtf-textil", title: "DTF Textil", description: "Personalización de prendas claras y oscuras.", icon: Shirt },
  { slug: "diseno-personalizado", title: "Diseño Personalizado", description: "Diseñamos tu idea para convertirla en un producto único.", icon: PenTool },
  { slug: "cortes-de-polifan", title: "Cortes de Polifan", description: "Corte de precisión en polifan para letras y piezas corpóreas.", icon: Scissors },
  { slug: "carteleria-corporea", title: "Cartelería Corpórea", description: "Carteles con volumen para locales, fachadas y marcas.", icon: Building2 },
  { slug: "souvenirs", title: "Souvenirs", description: "Recuerdos personalizados para eventos y celebraciones.", icon: Gift },
  { slug: "regalos-empresariales", title: "Regalos Empresariales", description: "Productos personalizados con la marca de tu empresa.", icon: Briefcase },
  { slug: "trofeos", title: "Trofeos", description: "Trofeos y reconocimientos personalizados a medida.", icon: Trophy },
  { slug: "carterias", title: "Cartelerías", description: "Señalética y cartelería para interior y exterior.", icon: Signpost },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);
export const MAX_PHOTOS_PER_SERVICE = 12;
