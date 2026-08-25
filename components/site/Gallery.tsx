"use client";

import { useState } from "react";
import Image from "next/image";

const VISIBLE_COUNT = 4;
// Lista explícita, no un rango numérico — public/images/ tiene huecos
// (nunca existieron muestra-trabajo3.jpg ni 8.jpg) y un rango fijo los
// pedía igual, rompiendo esas 2 fotos. Cuando Fernando agregue fotos
// nuevas a la carpeta hay que sumarlas acá a mano (no hay lectura
// dinámica del directorio — no existe ese patrón en el resto del sitio,
// y hacerlo en runtime no es seguro en Cloudflare Workers).
const NUMBERS = [1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const IMAGES = NUMBERS.map((n) => `/images/muestra-trabajo${n}.jpg`);

export default function Gallery() {
  const [showAll, setShowAll] = useState(false);
  const visibleImages = showAll ? IMAGES : IMAGES.slice(0, VISIBLE_COUNT);

  return (
    <section id="galeria" className="border-b border-white/5 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center" data-aos="fade-up">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-red">TRABAJOS DESTACADOS</p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">Trabajos que nos eligen</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleImages.map((src, i) => (
            <div
              key={src}
              data-aos="zoom-in"
              data-aos-delay={(i % 4) * 100}
              className="group aspect-square overflow-hidden rounded-xl border border-white/10"
            >
              <Image
                src={src}
                alt="Trabajo realizado por Láser Kind"
                width={400}
                height={400}
                className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-[1.06]"
              />
            </div>
          ))}
        </div>

        {!showAll && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:border-white/50"
            >
              Ver más trabajos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
