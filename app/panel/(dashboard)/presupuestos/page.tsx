import { getQuotes } from "@/lib/quotes";
import QuoteRow from "@/components/panel/presupuestos/QuoteRow";
import { updateQuoteStatusAction } from "./actions";

// D1 solo existe en tiempo real del Worker.
export const dynamic = "force-dynamic";

export default async function PresupuestosPage() {
  const quotes = await getQuotes();

  return (
    <>
      <h1 className="mb-2 text-xl font-bold text-gray-800">Presupuestos</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Se guardan solos al descargar un Presupuesto desde el Cotizador. Cuando el cliente confirma, marcalo{" "}
        <strong>Aceptado</strong> y usá &quot;Convertir a remito&quot; — mismo cliente y artículos, sin cargar nada
        de nuevo.
      </p>

      <div className="rounded border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[24%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[24%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                <th className="px-3 py-3">Número</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-400">
                    Todavía no se generó ningún presupuesto.
                  </td>
                </tr>
              ) : (
                // key incluye el contenido: el <select> de estado en
                // QuoteRow es "uncontrolled" (defaultValue) — sin esto,
                // tras "Guardar" la fila queda visualmente con el estado
                // viejo aunque la base ya se actualizó (React no resetea
                // defaultValue en un re-render normal, solo al montar).
                quotes.map((q) => <QuoteRow key={JSON.stringify(q)} quote={q} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms reales, fuera de la tabla — <form> no puede envolver un <tr>
          (HTML inválido, el browser lo descarta). Cada fila se asocia acá
          vía el atributo `form` (ver QuoteRow). */}
      {quotes.map((q) => (
        <form key={q.id} id={`quote-${q.id}`} action={updateQuoteStatusAction} />
      ))}
    </>
  );
}
