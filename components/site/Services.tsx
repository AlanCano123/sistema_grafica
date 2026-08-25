import { Sparkles, Printer, Shirt, PenTool, Scissors, Building2, Gift, Briefcase, Trophy, Signpost } from "lucide-react";

const SERVICES = [
  {
    icon: Sparkles,
    title: "Grabado Láser",
    description: "Grabados sobre madera, MDF, acrílico, metal, cuero, vidrio y más.",
  },
  {
    icon: Printer,
    title: "Impresión UV",
    description: "Impresión directa a todo color sobre diferentes superficies.",
  },
  {
    icon: Shirt,
    title: "DTF Textil",
    description: "Personalización de prendas claras y oscuras.",
  },
  {
    icon: PenTool,
    title: "Diseño Personalizado",
    description: "Diseñamos tu idea para convertirla en un producto único.",
  },
  {
    icon: Scissors,
    title: "Cortes de Polifan",
    description: "Corte de precisión en polifan para letras y piezas corpóreas.",
  },
  {
    icon: Building2,
    title: "Cartelería Corpórea",
    description: "Carteles con volumen para locales, fachadas y marcas.",
  },
  {
    icon: Gift,
    title: "Souvenirs",
    description: "Recuerdos personalizados para eventos y celebraciones.",
  },
  {
    icon: Briefcase,
    title: "Regalos Empresariales",
    description: "Productos personalizados con la marca de tu empresa.",
  },
  {
    icon: Trophy,
    title: "Trofeos",
    description: "Trofeos y reconocimientos personalizados a medida.",
  },
  {
    icon: Signpost,
    title: "Cartelerías",
    description: "Señalética y cartelería para interior y exterior.",
  },
];

export default function Services() {
  return (
    <section id="servicios" className="border-b border-white/5 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center" data-aos="fade-up">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-red">NUESTROS SERVICIOS</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            ¿Qué hacemos?
            <span className="mx-auto mt-4 block h-1 w-14 rounded-full bg-brand-red" />
          </h2>
          <p className="mt-5 text-xl font-semibold text-neutral-300 italic md:text-2xl">
            &quot;Que el límite sea tu imaginación&quot;
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {SERVICES.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="rounded-xl border border-white/10 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-white/[0.03]"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-brand-red/40 text-brand-red">
                <Icon className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm text-neutral-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
