"use client";

import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

interface DebtsDoughnutChartProps {
  receivable: number;
  payable: number;
}

export default function DebtsDoughnutChart({ receivable, payable }: DebtsDoughnutChartProps) {
  return (
    <Doughnut
      data={{
        labels: ["Cobros pendientes", "Pagos pendientes"],
        datasets: [
          {
            data: [receivable, payable],
            backgroundColor: ["#1cc88a", "#e74a3b"],
            hoverBackgroundColor: ["#17a673", "#d52a1a"],
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: { legend: { display: false } },
      }}
    />
  );
}
