"use client";
// client/components/DynamicChart.tsx
import React from "react";
import {
  Radar,
  Pie,
  Bar,
  Line,
  Doughnut,
  PolarArea,
  Bubble,
  Scatter,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

const DynamicChart = ({ type, data, labels, title }: any) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
        pointRadius: type === "scatter" || type === "bubble" ? 5 : undefined,
      },
    ],
  };

  switch (type) {
    case "radar":
      return <Radar data={chartData} />;
    case "pie":
      return <Pie data={chartData} />;
    case "bar":
      return <Bar data={chartData} />;
    case "line":
      return <Line data={chartData} />;
    case "doughnut":
      return <Doughnut data={chartData} />;
    case "polarArea":
      return <PolarArea data={chartData} />;
    case "bubble":
      return (
        <Bubble
          data={{
            datasets: [
              {
                label: title,
                data: [
                  { x: 1, y: 2, r: 10 },
                  { x: 2, y: 3, r: 20 },
                  { x: 3, y: 4, r: 15 },
                  { x: 4, y: 1, r: 25 },
                ],
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
              },
            ],
          }}
        />
      );
    case "scatter":
      return (
        <Scatter
          data={{
            datasets: [
              {
                label: title,
                data: [
                  { x: 1, y: 2 },
                  { x: 2, y: 3 },
                  { x: 3, y: 4 },
                  { x: 4, y: 5 },
                ],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
              },
            ],
          }}
        />
      );
    default:
      return <div>Unsupported chart type</div>;
  }
};

export default DynamicChart;
