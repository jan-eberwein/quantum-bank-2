"use client";
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const PolarAreaChart = () => {
  const data = {
    labels: ['Rent', 'Food & Beverage', 'Shopping', 'Tax', 'Life Expenses', 'Subscriptions'],
    datasets: [
      {
        label: 'Expenses',
        data: [35, 20, 25, 10, 5, 5],
        backgroundColor: [
          'rgba(139, 0, 0, 0.7)',     // Deep Red
          'rgba(178, 34, 34, 0.7)',   // Firebrick Red
          'rgba(205, 92, 92, 0.7)',   // Indian Red
          'rgba(220, 20, 60, 0.7)',   // Crimson
          'rgba(255, 69, 69, 0.7)',   // Bright Red
          'rgba(255, 99, 99, 0.7)'    // Light Red
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: 'Expenses',
        font: {
          size: 16
        }
      }
    },
    scales: {
      r: {
        ticks: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <PolarArea data={data} options={options} />
    </div>
  );
}

export default PolarAreaChart;