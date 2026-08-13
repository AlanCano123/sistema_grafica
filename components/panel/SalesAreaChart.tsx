"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface SalesAreaChartProps {
  labels: string[];
  data: number[];
}

// Mismo estilo que el area chart de SB Admin 2: línea azul suave con
// relleno tenue, sin leyenda.
export default function SalesAreaChart({ labels, data }: SalesAreaChartProps) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Ventas",
            data,
            tension: 0.3,
            borderColor: "#4e73df",
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            pointBackgroundColor: "#4e73df",
            pointBorderColor: "#4e73df",
            pointRadius: 3,
            fill: true,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: { tooltip: { backgroundColor: "#fff", titleColor: "#858796", bodyColor: "#858796", borderColor: "#dddfeb", borderWidth: 1 } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#858796" } },
          y: { grid: { color: "#eaecf4" }, ticks: { color: "#858796" } },
        },
      }}
    />
  );
}
