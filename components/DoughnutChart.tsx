"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
  const data = {
    datasets: [
      {
        lavel: 'Balance',
        data: [1250, 2500, 5000],
        backgroundColor: ["#0747b6", "#2265d8", "#3a83f9"],
      }
    ],
    labels: ['Checking', 'Savings', 'Investments']
  }

  const options = {
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };


    return <Doughnut data={data} options={options} />
}

export default DoughnutChart