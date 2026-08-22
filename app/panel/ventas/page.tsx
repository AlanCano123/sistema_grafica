import { getSales } from "@/lib/business";
import { formatPrice } from "@/lib/product-helpers";

// D1 solo existe en tiempo real del Worker — sin esto la página quedaría
// prerenderizada una vez en el build, sin poder leer la base todavía.
export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const sales = await getSales();
  const total = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Ventas</h1>
        <span className="text-sm text-gray-500">
          Total: <span className="font-bold text-[#4e73df]">{formatPrice(total)}</span>
        </span>
      </div>

      <div className="rounded border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-gray-400">
                    No hay ventas cargadas todavía.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{sale.description}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(sale.sale_date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-800">
                      {formatPrice(sale.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
