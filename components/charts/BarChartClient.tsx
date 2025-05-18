"use client";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import React from "react";

const BarChartClient = ({ data }: { data: any[] }) => (
  <BarChart width={300} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="amount" fill="#fa325a" />
  </BarChart>
);

export default BarChartClient;
