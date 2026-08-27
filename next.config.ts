import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Sin esto, `next dev` no ve los bindings de Cloudflare (D1, KV, etc.) —
// simula localmente los recursos definidos en wrangler.jsonc.
initOpenNextCloudflareForDev();

// CSP sin nonces a propósito — la forma "correcta" (con nonces) se genera
// desde middleware.ts/proxy.ts, y justo hoy el deploy real se rompió por
// un problema de runtime ahí (ver lib/panel-auth.ts) — no quiero apilar
// un segundo cambio de riesgo sobre middleware el mismo día. Esta CSP no
// toca middleware, va directo por next.config.ts — mejorable a nonces
// más adelante si hace falta más rigor.
// 'unsafe-inline' en script/style: App Router usa scripts inline para
// streaming de RSC — sin nonces no hay forma de evitarlo. challenges.cloudflare.com
// es el widget de Turnstile del login (script + iframe + su propio fetch).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://d2jygl58194cng.cloudfront.net https://d1ok1ldurjeiif.cloudfront.net https://assets.cdo.dev.yellowspot.com.ar https://assets.cdopromocionales.com https://mayapublicidad.com;
  font-src 'self';
  connect-src 'self' https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
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
