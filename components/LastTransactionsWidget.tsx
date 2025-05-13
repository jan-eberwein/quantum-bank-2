'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import useTransactions from '@/hooks/useTransactions';
import TransactionTable from '@/components/TransactionTable';

const LastTransactionsWidget = () => {
  const router = useRouter();
  const { user } = useUser();
  const { transactions } = useTransactions(user?.$id);

  const lastTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="last-transactions-widget border p-4 rounded-lg shadow-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <button
          onClick={() => router.push('/transactions')}
          className="text-sm font-medium text-blue-500 hover:underline"
        >
          Show all
        </button>
      </div>
      <TransactionTable transactions={lastTransactions} dateFormat="short" showStatus={false} />
    </div>
  );
};

export default LastTransactionsWidget;
