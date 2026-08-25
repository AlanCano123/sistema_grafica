"use client";

// Logo real (public/images/whatsapp-logo.png / instagram-logo.png) con
// fallback automático al ícono dibujado a mano si el archivo todavía no
// existe o falla al cargar (onError) — así no queda un ícono roto
// mientras Fernando no suba los archivos reales. En cuanto los archivos
// existan, esto muestra el logo real solo, sin tocar código de nuevo.
import { useState } from "react";
import Image from "next/image";
import { WhatsAppIcon, InstagramIcon } from "./BrandIcons";

const SRC = {
  whatsapp: "/images/whatsapp-logo.png",
  instagram: "/images/instagram-logo.png",
} as const;

const FALLBACK = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
} as const;

export default function BrandLogo({
  brand,
  size,
  className,
}: {
  brand: keyof typeof SRC;
  size: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const Fallback = FALLBACK[brand];
    return <Fallback className={className} />;
  }

  return (
    <Image
      src={SRC[brand]}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      // Sin esto, next/image no descarga la imagen hasta que entra en
      // viewport (lazy por default) — un ícono chico en el Footer podría
      // no cargar (ni fallar, ni mostrar el fallback) hasta que el
      // usuario scrollea hasta ahí. Son íconos de marca, siempre tienen
      // que intentar cargar de una.
      priority
    />
  );
}
