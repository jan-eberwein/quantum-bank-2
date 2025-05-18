"use client";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import React from "react";

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const PieChartClient = ({ data }: { data: any[] }) => (
  <PieChart width={300} height={300}>
    <Pie
      data={data}
      dataKey="amount"
      nameKey="category"
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#8884d8"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
);

export default PieChartClient;
