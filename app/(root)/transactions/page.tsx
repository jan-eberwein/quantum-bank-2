'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderBox from '@/components/HeaderBox';
import { Pagination } from '@/components/Pagination';
import TransactionTable from '@/components/TransactionTable';
import TransactionTableFilterArea from '@/components/TransactionTableFilterArea';
import { useCopilotReadable } from '@copilotkit/react-core';
import useUser from '@/hooks/useUser';
import useTransactions, { Transaction } from '@/hooks/useTransactions';
import useTransactionStatuses from '@/hooks/useTransactionStatuses';
import useTransactionCategories from '@/hooks/useTransactionCategories';

const ROWS_PER_PAGE = 14;

export default function TransactionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageParam = Number(searchParams.get('page') || '1');
    const currentPage = pageParam < 1 ? 1 : pageParam;

    const { user, loading: userLoading } = useUser();
    const { transactions, loading: txLoading } = useTransactions(user?.$id);
    const { statuses, loading: statusLoading } = useTransactionStatuses();
    const { categories, loading: catLoading } = useTransactionCategories();

    // ─── UI state ──────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [transactionType, setTransactionType] = useState('Incoming & Outgoing');
    const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
    const [hasSearched, setHasSearched] = useState(false);

    const updateQueryParams = (key: string, val: string) => {
        const p = new URLSearchParams(searchParams.toString());
        p.set(key, val);
        p.set('page', '1');
        router.push(`?${p.toString()}`);
    };

    const availableCategories = useMemo(
        () => ['All Categories', ...categories],
        [categories]
    );
    const availableStatuses = useMemo(
        () => ['All Statuses', ...statuses],
        [statuses]
    );

    const statusFilterMap = {
        'All Statuses': null,
        Pending: 'Pending',
        Completed: 'Completed',
    } as const;
    type StatusKey = keyof typeof statusFilterMap;

    const filtered = useMemo(() => {
        return transactions
            .filter((t) =>
                transactionType === 'Incoming & Outgoing'
                    ? true
                    : transactionType === 'incoming'
                        ? t.amount > 0
                        : t.amount < 0
            )
            .filter((t) =>
                selectedStatus === 'All Statuses'
                    ? true
                    : t.transactionStatusId === statusFilterMap[selectedStatus as StatusKey]
            )
            .filter((t) =>
                selectedCategory === 'All Categories'
                    ? true
                    : t.transactionCategoryId === selectedCategory
            )
            .filter((t) =>
                t.merchant.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter((t) => {
                if (!dateFilter.from && !dateFilter.to) return true;
                const d = new Date(t.createdAt);
                if (dateFilter.from && dateFilter.to) {
                    return d >= dateFilter.from && d <= dateFilter.to;
                }
                if (dateFilter.from) {
                    return d.toDateString() === dateFilter.from.toDateString();
                }
                return true;
            });
    }, [
        transactions,
        transactionType,
        selectedStatus,
        selectedCategory,
        searchQuery,
        dateFilter,
    ]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const sliceStart = (currentPage - 1) * ROWS_PER_PAGE;
    const currentRows = filtered.slice(sliceStart, sliceStart + ROWS_PER_PAGE);

    useCopilotReadable({ description: "All user transactions", value: transactions });
    useCopilotReadable({ description: "Transactions after filters", value: filtered });

    return (
        <div className="p-6">
            <HeaderBox title="Transactions" subtext="" />
            <div className="transaction-filter-wrapper">
                <TransactionTableFilterArea
                    searchQuery={searchQuery}
                    setSearchQuery={(v) => {
                        setSearchQuery(v);
                        setHasSearched(true);
                        updateQueryParams('searchQuery', v);
                    }}

                    selectedCategory={selectedCategory}
                    setSelectedCategory={(v) => {
                        setSelectedCategory(v);
                        setHasSearched(true);
                        updateQueryParams('category', v);
                    }}
                    availableCategories={availableCategories}

                    dateFilter={dateFilter}
                    setDateFilter={(range) => {
                        setDateFilter(range);
                        setHasSearched(true);
                        updateQueryParams(
                            'date',
                            `${range.from?.toISOString() ?? ''}_${range.to?.toISOString() ?? ''}`
                        );
                    }}

                    selectedStatus={selectedStatus}
                    setSelectedStatus={(v) => {
                        setSelectedStatus(v);
                        setHasSearched(true);
                        updateQueryParams('status', v);
                    }}
                    availableStatuses={availableStatuses}

                    transactionType={transactionType}
                    setTransactionType={(v) => {
                        setTransactionType(v);
                        setHasSearched(true);
                        updateQueryParams('transactionType', v);
                    }}
                    availableTransactionTypes={['Incoming & Outgoing', 'incoming', 'outgoing']}
                />
            </div>
            <section className="mt-6 flex flex-col gap-6">
                {txLoading ? (
                    <div className="text-center text-gray-500">Loading transactions…</div>
                ) : filtered.length === 0 && hasSearched ? (
                    <div className="text-center text-gray-500">No transactions found.</div>
                ) : (
                    <>
                        <TransactionTable
                            transactions={currentRows}
                            dateFormat="long"
                        />
                        {totalPages > 1 && (
                            <Pagination totalPages={totalPages} page={currentPage} />
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
