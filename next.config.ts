import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Sin esto, `next dev` no ve los bindings de Cloudflare (D1, KV, etc.) —
// simula localmente los recursos definidos en wrangler.jsonc.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    // Next 16 solo permite quality=75 por default; ProductCard pide 90
    // para que las fotos de producto no se vean pixeladas.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        // Dominio real de imágenes de producto (verificado contra la API).
        hostname: "d2jygl58194cng.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "d1ok1ldurjeiif.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "assets.cdo.dev.yellowspot.com.ar",
      },
      {
        protocol: "https",
        hostname: "assets.cdopromocionales.com",
      },
      {
        protocol: "https",
        // Imágenes de Maya Publicidad (verificado contra la API).
        hostname: "mayapublicidad.com",
      },
    ],
  },
};

export default nextConfig;
