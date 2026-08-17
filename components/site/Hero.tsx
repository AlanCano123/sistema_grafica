import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Target, Heart } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Calidad", sub: "garantizada" },
  { icon: Target, label: "Precisión", sub: "en cada detalle" },
  { icon: Heart, label: "Hecho", sub: "para vos" },
];

export default function Hero() {
  return (
    <section id="inicio" className="border-b border-white/5 px-5 pt-36 pb-20 md:px-8 md:pt-44 md:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div data-aos="fade-right">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-brand-red">
            DISEÑO · TECNOLOGÍA · PERSONALIZACIÓN
          </p>
          <h1 className="mb-6 text-4xl leading-[1.1] font-extrabold text-white md:text-5xl lg:text-6xl">
            Convertimos tus ideas
            <br className="hidden md:block" />
            en <span className="text-brand-red">realidad.</span>
          </h1>
          <p className="mb-8 max-w-md text-lg text-neutral-400">
            Grabado láser, impresión UV, DTF y productos personalizados creados especialmente para vos.
          </p>

          <div className="mb-12 flex flex-wrap gap-4">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-red-dark"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Pedir presupuesto
            </a>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 font-semibold text-white transition-colors hover:border-white/50"
            >
              Ver catálogo
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-6 w-6 text-brand-red" strokeWidth={1.8} />
                <span className="text-sm text-neutral-300">
                  {label}
                  <br />
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div data-aos="fade-left" data-aos-delay="100" className="relative">
          <div className="absolute -inset-1 z-0 rounded-2xl bg-gradient-to-br from-brand-red/35 to-transparent blur-xl" />
          <Image
            src="/images/impresora-logo.jpg"
            alt="Impresora láser grabando el logo de Láser Kind"
            width={800}
            height={600}
            className="relative z-10 w-full rounded-2xl border border-white/10 object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
