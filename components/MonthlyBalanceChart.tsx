"use client";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler for area coloring
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler for area filling
);

const MonthlyBalanceChart = () => {
  // Sample financial data for a single account
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const totalBalance = [9000, 9200, 9500, 9300, 9600, 10000];
  const income = [1000, 1200, 1500, 1300, 1600, 1800];
  const expenses = [550, 600, 200, 800, 400, 700];

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Total Balance',
        data: totalBalance,
        borderColor: '#0747b6',
        backgroundColor: 'rgba(7, 71, 182, 0.0)', // No fill
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#0747b6',
        fill: false
      },
      {
        label: 'Income',
        data: income,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.2)', // Light green fill
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'green',
        fill: true // Ensure fill is enabled
      },
      {
        label: 'Expenses',
        data: expenses,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.2)', // Light red fill
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'red',
        fill: true // Ensure fill is enabled
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: 'Monthly Financial Movement',
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + Number(value).toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default MonthlyBalanceChart;
