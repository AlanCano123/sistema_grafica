"use client";

import { SERVICES } from "@/lib/services";
import ServiceCard from "./ServiceCard";

export default function Services({ photoIdsBySlug }: { photoIdsBySlug: Record<string, number[]> }) {
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
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.slug}
              title={service.title}
              description={service.description}
              slug={service.slug}
              icon={service.icon}
              photoIds={photoIdsBySlug[service.slug] ?? []}
              aosDelay={i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
