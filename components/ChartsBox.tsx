"use client";
import React from "react";
import dynamic from "next/dynamic";
import {
  mockCategoriesData,
  mockMonthlySpending,
  mockIncomeVsExpenses,
} from "@/constants/index";

// Dynamischer Import – keine SSR!
const PieChartClient = dynamic(() => import("./charts/PieChartClient"), { ssr: false });
const BarChartClient = dynamic(() => import("./charts/BarChartClient"), { ssr: false });
const LineChartClient = dynamic(() => import("./charts/LineChartClient"), { ssr: false });

const ChartsBox = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="chart-box">
        <h3 className="text-lg font-semibold mb-2">Spending by Categories</h3>
        <PieChartClient data={mockCategoriesData} />
      </div>

      <div className="chart-box">
        <h3 className="text-lg font-semibold mb-2">Monthly Spending</h3>
        <BarChartClient data={mockMonthlySpending} />
      </div>

      <div className="chart-box">
        <h3 className="text-lg font-semibold mb-2">Income vs Expenses</h3>
        <LineChartClient data={mockIncomeVsExpenses} />
      </div>
    </div>
  );
};

export default ChartsBox;
