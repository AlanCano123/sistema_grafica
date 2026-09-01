"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function ServiceCard({
  title,
  description,
  slug,
  icon: Icon,
  photoIds,
  aosDelay,
}: {
  title: string;
  description: string;
  slug: string;
  icon: LucideIcon;
  photoIds: number[];
  aosDelay: number;
}) {
  const [open, setOpen] = useState(false);
  const hasPhotos = photoIds.length > 0;

  const cardInner = (
    <>
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-brand-red/40 text-brand-red">
        <Icon className="h-7 w-7" strokeWidth={1.8} />
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
      {hasPhotos && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
          <Images className="h-3.5 w-3.5" /> Ver fotos ({photoIds.length})
        </span>
      )}
    </>
  );

  const cardClass =
    "rounded-xl border border-white/10 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/50 hover:bg-white/[0.03]";

  return (
    <>
      {hasPhotos ? (
        <button
          type="button"
          data-aos="fade-up"
          data-aos-delay={aosDelay}
          onClick={() => setOpen(true)}
          className={`${cardClass} cursor-pointer`}
        >
          {cardInner}
        </button>
      ) : (
        <div data-aos="fade-up" data-aos-delay={aosDelay} className={cardClass}>
          {cardInner}
        </div>
      )}

      {open && <Lightbox title={title} slug={slug} photoIds={photoIds} onClose={() => setOpen(false)} />}
    </>
  );
}

function Lightbox({
  title,
  slug,
  photoIds,
  onClose,
}: {
  title: string;
  slug: string;
  photoIds: number[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  function go(delta: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.min(Math.max(index + delta, 0), photoIds.length - 1);
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, index]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-label={`Fotos de ${title}`}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const el = e.currentTarget;
              setIndex(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {photoIds.map((id) => (
              <div key={id} className="w-full flex-none snap-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/fotos/${slug}/${id}`}
                  alt={title}
                  className="mx-auto max-h-[70vh] w-auto object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {photoIds.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index === photoIds.length - 1}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white disabled:opacity-30"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {photoIds.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {photoIds.map((id, i) => (
              <span key={id} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-brand-red" : "bg-white/30"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
