// client/components/ChartsBox.tsx
"use client";
import React from "react";
import {
  BarChart,
  PieChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
  Pie,
  Cell,
  Line, // Import Line component
} from "recharts";
import { mockCategoriesData, mockMonthlySpending, mockIncomeVsExpenses } from "@/constants/index";

const ChartsBox = () => {
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pie Chart: Categories Spending */}
      <div className="chart-box">
        <h3 className="text-lg font-semibold mb-2">Spending by Categories</h3>
        <PieChart width={300} height={300}>
          <Pie data={mockCategoriesData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
            {mockCategoriesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Bar Chart: Monthly Spending */}
      <div className="chart-box">
        <h3 className="text-lg font-semibold mb-2">Monthly Spending</h3>
        <BarChart width={300} height={300} data={mockMonthlySpending}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#fa325a" />
        </BarChart>
      </div>

      {/* Line Chart: Income vs Expenses */}
      <div className="chart-box">
        <h3 className="text-lg font-semibold mb-2">Income vs Expenses</h3>
        <LineChart width={300} height={300} data={mockIncomeVsExpenses}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#82ca9d" />
          <Line type="monotone" dataKey="expenses" stroke="#fa325a" />
        </LineChart>
      </div>
    </div>
  );
};

export default ChartsBox;
