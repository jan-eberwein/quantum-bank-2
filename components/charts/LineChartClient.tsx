"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatEuroCents } from "@/lib/format";

interface LineChartClientProps {
  data: { month: string; income: number; expenses: number }[];
}

export default function LineChartClient({ data }: LineChartClientProps) {
  return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 60, bottom: 5 }} // Increased left margin from 0 to 60
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
              tickFormatter={(value) =>
                  formatEuroCents(Math.round(value * 100))
              }
              width={50} // Added explicit width for Y-axis
          />
          <Tooltip
              formatter={(value: number) =>
                  formatEuroCents(Math.round(value * 100))
              }
          />
          <Legend verticalAlign="top" height={36} />
          <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
          />
          <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
  );
}