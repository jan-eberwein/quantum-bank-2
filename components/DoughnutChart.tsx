"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import useBalance from "@/hooks/useBalance";
import { useUser } from "@/context/UserContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
  const { user } = useUser();
  const { balance, loading } = useBalance(user?.$id);

  if (loading || !user) return <p>Loading chart…</p>;

  const total = balance / 100;

  // Placeholder split logic – adjust if you have real categories
  const savings = total * 0.2;
  const crypto = total * 0.5;
  const cash = total - savings - crypto;

  const data = {
    labels: ["Savings", "Crypto", "Cash"],
    datasets: [
      {
        label: "Balance",
        data: [savings, crypto, cash],
        backgroundColor: ["#0747b6", "#2265d8", "#3a83f9"],
        hoverOffset: 12,
        spacing: 1,
        borderRadius: 0, // Creates visible gaps between arcs
      },
    ],
  };

  const options = {
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `€${value.toFixed(2)}`;
          },
        },
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default DoughnutChart;
