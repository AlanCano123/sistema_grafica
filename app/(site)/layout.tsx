import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AOSInit from "@/components/site/AOSInit";
import FloatingWhatsApp from "@/components/site/FloatingWhatsApp";
import { CartProvider } from "@/lib/cart-context";

// La fuente Inter se aplica en <body> desde app/layout.tsx, no acá —
// ver el comentario ahí (tiene que ver con cómo el Suspense boundary de
// app/(site)/catalogo/loading.tsx streamea el contenido).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AOSInit />
      <Header />
      {children}
      <Footer />
      <FloatingWhatsApp />
    </CartProvider>
  );
}
