'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderBox from '@/components/HeaderBox';
import { Pagination } from '@/components/Pagination';
import TransactionTable from '@/components/TransactionTable';
import TransactionTableFilterArea from '@/components/TransactionTableFilterArea';
import { useCopilotReadable } from '@copilotkit/react-core';
import useUser from '@/hooks/useUser';
import useTransactions from '@/hooks/useTransactions';

const Transactions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Number(pageParam);
  const rowsPerPage = 14;

  const { user } = useUser();
  const { transactions } = useTransactions(user?.$id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [transactionType, setTransactionType] = useState('Incoming & Outgoing');

  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const statusFilterMap = {
    Completed: false,
    Pending: true,
    'All Statuses': null,
  };

  const filteredTransactions = transactions
    .filter((t) => transactionType === 'Incoming & Outgoing' || (transactionType === 'incoming' && t.amount > 0) || (transactionType === 'outgoing' && t.amount < 0))
    .filter((t) => selectedStatus === 'All Statuses' || t.pending === statusFilterMap[selectedStatus])
    .filter((t) => selectedCategory === 'All Categories' || t.category.toLowerCase() === selectedCategory.toLowerCase())
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((t) => {
      const transactionDate = new Date(t.date);
      if (dateFilter.from && dateFilter.to) {
        return transactionDate >= dateFilter.from && transactionDate <= dateFilter.to;
      } else if (dateFilter.from) {
        return transactionDate.toDateString() === dateFilter.from.toDateString();
      }
      return true;
    });

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);

  useCopilotReadable({
    description: "All transactions of the user's bank account.",
    value: transactions,
  });
  useCopilotReadable({
    description: 'Filtered transactions based on current filters.',
    value: filteredTransactions,
  });

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox title="Transactions" subtext="" />
      </div>
      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">{user?.firstName || '...'}</h2>
            <p className="text-14 text-blue-25">{user?.email}</p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              User ID: {user?.$id}
            </p>
          </div>
        </div>
        <TransactionTableFilterArea
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
            setSearchQuery(val);
            updateQueryParams('searchQuery', val);
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={(val) => {
            setSelectedCategory(val);
            updateQueryParams('category', val);
          }}
          dateFilter={dateFilter}
          setDateFilter={(filter) => {
            setDateFilter(filter);
            const from = filter.from?.toISOString() ?? '';
            const to = filter.to?.toISOString() ?? '';
            updateQueryParams('date', `${from}_${to}`);
          }}
          selectedStatus={selectedStatus}
          setSelectedStatus={(val) => {
            setSelectedStatus(val);
            updateQueryParams('status', val);
          }}
          transactionType={transactionType}
          setTransactionType={(val) => {
            setTransactionType(val);
            updateQueryParams('transactionType', val);
          }}
          availableStatuses={['All Statuses', 'Pending', 'Completed']}
          availableTransactionTypes={[
            'Incoming & Outgoing',
            'incoming',
            'outgoing',
          ]}
        />
        <section className="flex w-full flex-col gap-6">
          <TransactionTable transactions={currentTransactions} dateFormat="long" />
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
