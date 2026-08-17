import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";

export const metadata: Metadata = {
  title: "Láser Kind — Grabado láser, impresión UV y DTF en Río Gallegos",
  description:
    "Grabado láser, impresión UV, DTF y productos personalizados en Río Gallegos, Santa Cruz. Convertimos tus ideas en realidad.",
};

// La fuente Inter se aplica acá (en <body>, no en un div wrapper de
// app/(site)/layout.tsx) porque el Suspense boundary de
// app/(site)/catalogo/loading.tsx hace que el contenido streameado quede
// como hermano del wrapper en vez de hijo, y entonces no hereda su
// font-family. En <body> siempre queda arriba de todo pase lo que pase
// con el streaming.
// El panel (app/panel/layout.tsx) pisa esto con Nunito en su propio wrapper
// — ese sí anida bien porque /panel no tiene loading.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`min-h-full flex flex-col bg-neutral-950 ${inter.className}`}>{children}</body>
    </html>
  );
}
