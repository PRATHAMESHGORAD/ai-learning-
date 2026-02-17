import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PracticeTimeChart({ value }) {
  // value = total active seconds
  const totalRangeSeconds = 24 * 60 * 60; // 1 day baseline
  const active = value || 0;
  const idle = Math.max(totalRangeSeconds - active, 0);

  const data = {
    labels: ["Active Learning", "Idle / Not Active"],
    datasets: [
      {
        data: [active, idle],
        backgroundColor: ["#36cfc9", "#ff6b81"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${formatTime(ctx.raw)}`,
        },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ width: 280, margin: "auto", position: "relative" }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        {formatTime(active)}
      </div>
    </div>
  );
}
