"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatEuroCents } from "@/lib/format";

interface BarChartClientProps {
  data: { month: string; amount: number }[];
}

export default function BarChartClient({ data }: BarChartClientProps) {
  return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
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
          <Bar
              dataKey="amount"
              name="Expenses"
              fill="#EF4444"
              barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
  );
}