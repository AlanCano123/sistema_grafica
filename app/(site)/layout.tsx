import NavBar from "@/components/NavBar";

// La fuente Satoshi se aplica en <body> desde app/layout.tsx, no acá —
// ver el comentario ahí (tiene que ver con cómo el Suspense boundary de
// loading.tsx streamea el contenido).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
