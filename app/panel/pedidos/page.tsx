import { getOrdersByStatus, getOnTimeStats, OrderStatus } from "@/lib/orders";
import StatCard from "@/components/StatCard";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const COLUMNS: { status: OrderStatus; title: string; accent: string }[] = [
  { status: "pendiente", title: "Pendientes / Aprobados", accent: "#f6c23e" },
  { status: "produccion", title: "En producción", accent: "#4e73df" },
  { status: "terminado", title: "Terminados", accent: "#1cc88a" },
];

export default async function PedidosPage() {
  const onTime = getOnTimeStats();

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-gray-800">Pedidos</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Cumplimiento a tiempo"
          value={`${onTime.pct}%`}
          accent="green"
          icon={CheckCircle2}
          sublabel={`${onTime.onTime} entregados a tiempo`}
        />
        <StatCard
          label="Entregas con retraso"
          value={String(onTime.late)}
          accent="red"
          icon={AlertTriangle}
          sublabel="Sobre el total de entregados"
        />
        <StatCard
          label="En cola"
          value={String(getOrdersByStatus("pendiente").length + getOrdersByStatus("produccion").length)}
          accent="blue"
          icon={Clock}
          sublabel="Pendientes + en producción"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map(({ status, title, accent }) => {
          const orders = getOrdersByStatus(status);
          return (
            <div key={status} className="rounded border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold" style={{ color: accent }}>
                  {title}
                </h2>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {orders.length}
                </span>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">Nada acá.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">{order.id}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.dueDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-800">{order.client}</p>
                      <p className="text-xs text-gray-500">{order.description}</p>
                      {order.deliveredOnTime === false && (
                        <span className="mt-1 inline-block rounded-full bg-[#e74a3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#e74a3b]">
                          Entregado con retraso
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
