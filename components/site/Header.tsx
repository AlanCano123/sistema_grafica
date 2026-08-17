"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#calculadora", label: "Calculadora" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#contacto", label: "Contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  // Header con blur al hacer scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nav activo según sección visible (solo aplica en la home, en otras
  // páginas no hay secciones con id que observar — el observer no
  // encuentra nada y no hace nada, es seguro dejarlo siempre montado).
  useEffect(() => {
    const sections = document.querySelectorAll("main section[id]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const isActive = (href: string) => href.includes("#") && href.endsWith(activeHash) && activeHash !== "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        scrolled ? "border-white/10 bg-neutral-950/90 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/logo-empresa.jpg"
            alt="Láser Kind"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-lg leading-none font-extrabold tracking-wide text-white">
            LASER
            <br />
            <span className="text-brand-red">KIND</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative transition-colors hover:text-white ${isActive(link.href) ? "text-white" : ""}`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-brand-red" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir presupuesto
          </a>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="p-2 text-white md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-neutral-950 transition-[max-height] duration-300 md:hidden ${
          menuOpen ? "max-h-[28rem]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-5 py-4 text-sm font-medium text-neutral-300">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 font-semibold text-white"
          >
            Pedir presupuesto
          </a>
        </div>
      </div>
    </header>
  );
}
