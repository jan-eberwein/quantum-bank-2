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

  // ✅ Pass refreshKey to useTransactions to trigger data refresh
  const { transactions, loading: transactionsLoading } = useTransactions(user?.$id, refreshKey);
  const { categories, loading: categoriesLoading } = useTransactionCategories();

  // Show loading state while data is being fetched
  if (transactionsLoading || categoriesLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
          ))}
        </div>
    );
  }

  // 1) Spending by category (in €) - Updated with refreshKey dependency
  const pieData = useMemo(() => {
    console.log('🔄 Recalculating pie chart data - refreshKey:', refreshKey);
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
  }, [transactions, categories, refreshKey]); // ✅ refreshKey dependency added

  // 2) Monthly spending - Updated with refreshKey dependency
  const barData = useMemo(() => {
    console.log('🔄 Recalculating bar chart data - refreshKey:', refreshKey);
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
  }, [transactions, refreshKey]); // ✅ refreshKey dependency added

  // 3) Income vs. expenses per month - Updated with refreshKey dependency
  const lineData = useMemo(() => {
    console.log('🔄 Recalculating line chart data - refreshKey:', refreshKey);
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
  }, [transactions, refreshKey]); // ✅ refreshKey dependency added

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">
            Spending by Categories
            {/* Debug indicator */}
            <span className="text-xs text-gray-400 ml-2">({pieData.length} categories)</span>
          </h3>
          {pieData.length > 0 ? (
              <PieChartClient data={pieData} />
          ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No spending data available
              </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">
            Monthly Spending
            <span className="text-xs text-gray-400 ml-2">({barData.length} months)</span>
          </h3>
          {barData.length > 0 ? (
              <BarChartClient data={barData} />
          ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No monthly data available
              </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">
            Income vs Expenses
            <span className="text-xs text-gray-400 ml-2">({lineData.length} months)</span>
          </h3>
          {lineData.length > 0 ? (
              <LineChartClient data={lineData} />
          ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No income/expense data available
              </div>
          )}
        </div>
      </div>
  );
};

export default ChartsBox;