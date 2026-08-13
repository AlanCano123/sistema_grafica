import localFont from "next/font/local";

// Tipografía tomada del template next-ecommerce-shopco (fuente Satoshi,
// archivos originales incluidos en esa carpeta). Escopeada solo a la
// sección pública (catálogo/calculadora) — el panel usa Nunito aparte.
export const satoshi = localFont({
  src: [
    { path: "./Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  fallback: ["sans-serif"],
  variable: "--font-satoshi",
});
