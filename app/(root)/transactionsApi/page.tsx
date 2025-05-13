'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import HeaderBox from '@/components/HeaderBox';
import { Pagination } from '@/components/Pagination';
import TransactionTable from '@/components/TransactionTable';
import useTransactions from '@/hooks/useTransactions';
import useUser from '@/hooks/useUser';

const Transactions = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const currentPage = Number(page) || 1;
  const rowsPerPage = 14;

  const { user, loading: userLoading, error: userError } = useUser();
  const userId = user?.$id;

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions(userId);

  if (userLoading || transactionsLoading) {
    return <div>Loading...</div>;
  }

  if (userError) {
    return <div>Error fetching user: {userError}</div>;
  }

  if (transactionsError) {
    return <div>Error fetching transactions: {transactionsError}</div>;
  }

  if (!user || !transactions) {
    return <div>No user or transaction data available.</div>;
  }

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox title="Transactions (API)" subtext="" />
      </div>
      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-14 text-blue-25">{user.email}</p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              User ID: {userId}
            </p>
          </div>
        </div>
        <section className="flex w-full flex-col gap-6">
          <TransactionTable transactions={currentTransactions} />
          {totalPages > 1 && (
            <div className="my-4 w-full">
              <Pagination totalPages={totalPages} page={currentPage} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Transactions;
