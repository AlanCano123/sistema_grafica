import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-4">
        <span className="text-lg font-bold text-black">Sistema Gráfica</span>
        <Link href="/" className="text-sm font-medium text-black/60 hover:text-black">
          Catálogo
        </Link>
        <Link href="/panel" className="text-sm font-medium text-black/60 hover:text-black">
          Panel
        </Link>
      </div>
    </nav>
  );
}
