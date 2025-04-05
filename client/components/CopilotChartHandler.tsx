"use client";

import { useState } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import DynamicChart from "./DynamicChart";
import { mockAccounts } from "@/constants/index";

interface Transaction {
  $id: string;
  name: string;
  accountId: string;
  amount: number;
  pending: boolean;
  category: string;
  date: string;
  $createdAt: string;
}

const CopilotChartHandler = () => {
  const [charts, setCharts] = useState<
    {
      id: number;
      type: "bar" | "line" | "pie" | "doughnut" | "polarArea";
      data: number[];
      labels: string[];
      title: string;
    }[]
  >([]);

  const parseTimeRange = (timeRange?: string): Date | null => {
    if (!timeRange) return null;
    const now = new Date();
    const pastDate = new Date();
    
    const match = timeRange.match(/last (\d+) (day|week|month|year)s?/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      switch (unit) {
        case "day": pastDate.setDate(now.getDate() - value); break;
        case "week": pastDate.setDate(now.getDate() - value * 7); break;
        case "month": pastDate.setMonth(now.getMonth() - value); break;
        case "year": pastDate.setFullYear(now.getFullYear() - value); break;
      }
      return pastDate;
    }
    return null;
  };

  const filterTransactionsByTimeRange = (transactions: Transaction[], timeRange?: string): Transaction[] => {
    const pastDate = parseTimeRange(timeRange);
    if (!pastDate) return transactions;
    return transactions.filter(txn => new Date(txn.date) >= pastDate);
  };

  useCopilotAction({
    name: "generateChart",
    description: "Generate a financial chart based on user input",
    parameters: [
      {
        name: "chartType",
        type: "string",
        description: "Chart type (e.g., line, bar, pie, doughnut, polarArea)",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Data category (e.g., income, expenses, savings, spending, categories)",
        required: true,
      },
      {
        name: "timeRange",
        type: "string",
        description: "Time range (e.g., last 30 days, last 4 months, last 2 years, last decade)",
        required: false,
      },
    ],
    handler: async ({ chartType, category, timeRange }) => {
      console.log("🚀 Copilot Action Triggered:", { chartType, category, timeRange });

      let labels: string[] = [];
      let data: number[] = [];
      let title = `${category} over ${timeRange || "last few months"}`;

      const transactions = filterTransactionsByTimeRange(mockAccounts[0].transactions, timeRange);
      const incomeTransactions = transactions.filter(txn => txn.name.toLowerCase().includes("salary"));
      const expenseTransactions = transactions.filter(txn => !txn.name.toLowerCase().includes("salary"));
      
      const income = incomeTransactions.reduce((sum, txn) => sum + txn.amount, 0);
      const expenses = expenseTransactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
      
      const categoryData = expenseTransactions.reduce((acc: Record<string, number>, transaction: Transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category] += Math.abs(transaction.amount);
        return acc;
      }, {});

      switch (category) {
        case "incomeVsExpenses":
          labels = ["Income", "Expenses"];
          data = [income, expenses];
          title = `Income vs Expenses over ${timeRange || "time"}`;
          break;
        case "expenses":
        case "categories":
          labels = Object.keys(categoryData);
          data = Object.values(categoryData);
          title = `Spending by Category (€) over ${timeRange || "all time"}`;
          break;
        default:
          console.warn("⚠️ Invalid category received:", category);
          return;
      }

      setCharts(prevCharts => [
        ...prevCharts,
        { id: Date.now(), type: chartType as "bar" | "line" | "pie" | "doughnut" | "polarArea", data, labels, title }
      ]);

      console.log("✅ Chart Added:", { chartType, data, labels });
    },
  });

  useCopilotAction({
    name: "deleteLastChart",
    description: "Remove the last generated chart",
    handler: async () => {
      setCharts((prevCharts) => prevCharts.slice(0, -1));
    },
  });

  useCopilotAction({
    name: "deleteAllCharts",
    description: "Remove all generated charts",
    handler: async () => {
      setCharts([]);
    },
  });

  return (
    <div className="copilot-chart-window">
      {charts.map((chart) => (
        <div key={chart.id} className="mb-4 relative">
          <button
            onClick={() => setCharts((prevCharts) => prevCharts.filter((c) => c.id !== chart.id))}
            className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full"
          >
            ✖
          </button>
          <h3 className="font-bold">{chart.title}</h3>
          <DynamicChart
            type={chart.type}
            data={chart.data}
            labels={chart.labels}
            title={chart.title}
          />
        </div>
      ))}
    </div>
  );
};

export default CopilotChartHandler;
