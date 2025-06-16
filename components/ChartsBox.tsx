// components/ChartsBox.tsx
"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";

import useUser from "@/hooks/useUser";
import useTransactions from "@/hooks/useTransactions";
import useTransactionCategories from "@/hooks/useTransactionCategories";

// Load your chart components only on the client
const PieChartClient = dynamic(() => import("./charts/PieChartClient"), { ssr: false });
const BarChartClient = dynamic(() => import("./charts/BarChartClient"), { ssr: false });
const LineChartClient = dynamic(() => import("./charts/LineChartClient"), { ssr: false });

interface ChartsBoxProps {
  refreshKey?: number;
}

const ChartsBox: React.FC<ChartsBoxProps> = ({ refreshKey = 0 }) => {
  const { user } = useUser();
  const { transactions } = useTransactions(user?.$id, refreshKey); // Pass refreshKey to trigger updates
  const { categories } = useTransactionCategories();

  // 1) Spending by category (in €)
  const pieData = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.amount < 0) {
        const euros = Math.abs(t.amount) / 100;
        const name =
            categories.find((c) => c.$id === t.transactionCategoryId)?.name ||
            "Uncategorized";
        totals.set(name, (totals.get(name) || 0) + euros);
      }
    });
    return Array.from(totals, ([category, amount]) => ({ category, amount }));
  }, [transactions, categories, refreshKey]); // Add refreshKey to dependencies

  // 2) Monthly spending (sum of expenses per month, in €), sorted Jan→Dec
  const barData = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.amount < 0) {
        const month = format(new Date(t.createdAt), "MMM");
        const euros = Math.abs(t.amount) / 100;
        totals.set(month, (totals.get(month) || 0) + euros);
      }
    });
    // sort by calendar order
    const monthsOrder = [
      "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    return Array.from(totals, ([month, amount]) => ({ month, amount }))
        .sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
  }, [transactions, refreshKey]); // Add refreshKey to dependencies

  // 3) Income vs. expenses per month (in €), sorted Jan→Dec
  const lineData = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    transactions.forEach((t) => {
      const month = format(new Date(t.createdAt), "MMM");
      const entry = map.get(month) ?? { income: 0, expenses: 0 };
      if (t.amount > 0) entry.income += t.amount / 100;
      else entry.expenses += Math.abs(t.amount) / 100;
      map.set(month, entry);
    });
    const monthsOrder = [
      "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    return Array.from(map, ([month, { income, expenses }]) => ({
      month,
      income,
      expenses,
    })).sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
  }, [transactions, refreshKey]); // Add refreshKey to dependencies

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Spending by Categories</h3>
          <PieChartClient data={pieData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Monthly Spending</h3>
          <BarChartClient data={barData} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Income vs Expenses</h3>
          <LineChartClient data={lineData} />
        </div>
      </div>
  );
};

export default ChartsBox;