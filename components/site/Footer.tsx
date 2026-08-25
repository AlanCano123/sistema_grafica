import Image from "next/image";
import Link from "next/link";
import { PhoneIcon, LocationIcon } from "./BrandIcons";
import BrandLogo from "./BrandLogo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import BackToTop from "./BackToTop";

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-white/5 px-5 pt-16 pb-8 md:px-8">
      <div className="mx-auto mb-12 grid max-w-7xl gap-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-3">
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
          <p className="max-w-xs text-sm text-neutral-500">
            Diseño, tecnología y precisión para crear productos únicos.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-brand-red">CONTACTO</p>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-center gap-2.5">
              <PhoneIcon className="h-4 w-4 shrink-0 text-brand-red" />
              <a href="tel:+542966226605" className="transition-colors hover:text-white">
                2966 22-6605
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <BrandLogo brand="instagram" size={16} className="h-4 w-4 shrink-0" />
              <a
                href="https://instagram.com/laser.kind"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                @laser.kind
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
              <span>Zapiola 253, Río Gallegos, Santa Cruz</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-brand-red">LÁSER KIND</p>
          <p className="mb-5 text-sm text-neutral-400">Diseño · Grabado · Personalización</p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/laser.kind"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/40 hover:text-white"
            >
              <BrandLogo brand="instagram" size={28} className="h-7 w-7" />
            </a>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/40 hover:text-white"
            >
              <BrandLogo brand="whatsapp" size={28} className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
        <p className="text-xs text-neutral-600">
          &copy; {new Date().getFullYear()} Láser Kind. Todos los derechos reservados.
        </p>
        <BackToTop />
      </div>
    </footer>
  );
}
