"use client";
import React from "react";
import { useRouter } from "next/navigation";
import TransactionTable from "@/components/TransactionTable";
import { mockAccounts } from "@/constants/index";

const LastTransactionsWidget = () => {
  const router = useRouter(); // Hook for navigation
  const account = mockAccounts[0]; // Assuming the first account is the one to display

  if (!account || !account.transactions) {
    return <div>No transactions available.</div>;
  }

  // Get the last 5 transactions sorted by date
  const lastFiveTransactions = [...account.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  return (
    <div className="last-transactions-widget border p-4 rounded-lg shadow-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <button
          onClick={() => router.push("/transactions")}
          className="text-sm font-medium text-blue-500 hover:underline"
        >
          Show all
        </button>
      </div>
      <TransactionTable transactions={lastFiveTransactions} dateFormat="short" showStatus={false} />
    </div>
  );
};

export default LastTransactionsWidget;
