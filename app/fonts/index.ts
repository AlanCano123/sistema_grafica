import { Inter } from "next/font/google";

// Inter es Google Font, se carga directo (a diferencia de Satoshi antes,
// que era local). Se aplica en <body> desde app/layout.tsx, no en un div
// wrapper de app/(site)/layout.tsx — ver el comentario ahí (Suspense
// boundary de app/(site)/catalogo/loading.tsx hace que el contenido
// streameado quede como hermano del wrapper, no como hijo).
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});
