import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
