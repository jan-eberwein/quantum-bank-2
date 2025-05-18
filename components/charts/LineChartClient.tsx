"use client";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import React from "react";

const LineChartClient = ({ data }: { data: any[] }) => (
  <LineChart width={300} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="income" stroke="#82ca9d" />
    <Line type="monotone" dataKey="expenses" stroke="#fa325a" />
  </LineChart>
);

export default LineChartClient;
