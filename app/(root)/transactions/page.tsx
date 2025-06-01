'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderBox from '@/components/HeaderBox';
import { Pagination } from '@/components/Pagination';
import TransactionTable from '@/components/TransactionTable';
import TransactionTableFilterArea from '@/components/TransactionTableFilterArea';
import { useCopilotReadable } from '@copilotkit/react-core';
import useUser from '@/hooks/useUser';
import useTransactions from '@/hooks/useTransactions';
import useTransactionStatuses from '@/hooks/useTransactionStatuses';
import useTransactionCategories from '@/hooks/useTransactionCategories';
import { Transaction } from '@/types/Transaction';

const ROWS_PER_PAGE = 14;

export default function TransactionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageParam = Number(searchParams.get('page') || '1');
    const currentPage = pageParam < 1 ? 1 : pageParam;

    // Get initial filter values from URL params
    const initialSearchQuery = searchParams.get('searchQuery') || '';
    const initialCategory = searchParams.get('category') || 'All Categories';
    const initialStatus = searchParams.get('status') || 'All Statuses';
    const initialTransactionType = searchParams.get('transactionType') || 'Incoming & Outgoing';

    const { user, loading: userLoading } = useUser();
    const { transactions, loading: txLoading } = useTransactions(user?.$id);
    const { statuses, loading: statusLoading } = useTransactionStatuses();
    const { categories, loading: catLoading } = useTransactionCategories();

    // UI state
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [transactionType, setTransactionType] = useState(initialTransactionType);
    const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
    const [hasSearched, setHasSearched] = useState(false);

    // Update URL params helper
    const updateQueryParams = (key: string, val: string) => {
        const p = new URLSearchParams(searchParams.toString());
        if (val) {
            p.set(key, val);
        } else {
            p.delete(key);
        }
        p.set('page', '1');
        router.push(`?${p.toString()}`);
    };

    // Available filter options
    const availableCategories = useMemo(
        () => ['All Categories', ...categories.map(cat => cat.name)],
        [categories]
    );
    const availableStatuses = useMemo(
        () => ['All Statuses', ...statuses.map(status => status.name)],
        [statuses]
    );

    // Create lookup maps for filtering
    const categoryIdMap = useMemo(
        () => new Map(categories.map(cat => [cat.name, cat.$id])),
        [categories]
    );
    const statusIdMap = useMemo(
        () => new Map(statuses.map(status => [status.name, status.$id])),
        [statuses]
    );

    // Filter transactions
    const filtered = useMemo(() => {
        return transactions
            .filter((t) => {
                // Transaction type filter
                if (transactionType === 'incoming') return t.amount > 0;
                if (transactionType === 'outgoing') return t.amount < 0;
                return true; // 'Incoming & Outgoing'
            })
            .filter((t) => {
                // Status filter
                if (selectedStatus === 'All Statuses') return true;
                const statusId = statusIdMap.get(selectedStatus);
                return statusId ? t.transactionStatusId === statusId : false;
            })
            .filter((t) => {
                // Category filter
                if (selectedCategory === 'All Categories') return true;
                const categoryId = categoryIdMap.get(selectedCategory);
                return categoryId ? t.transactionCategoryId === categoryId : false;
            })
            .filter((t) => {
                // Search query filter
                if (!searchQuery) return true;
                const searchLower = searchQuery.toLowerCase();
                return (
                    t.merchant.toLowerCase().includes(searchLower) ||
                    (t.description && t.description.toLowerCase().includes(searchLower))
                );
            })
            .filter((t) => {
                // Date filter
                if (!dateFilter.from && !dateFilter.to) return true;
                const transactionDate = new Date(t.createdAt);

                if (dateFilter.from && dateFilter.to) {
                    return transactionDate >= dateFilter.from && transactionDate <= dateFilter.to;
                }
                if (dateFilter.from) {
                    return transactionDate.toDateString() === dateFilter.from.toDateString();
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
        statusIdMap,
        categoryIdMap,
    ]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const sliceStart = (currentPage - 1) * ROWS_PER_PAGE;
    const currentRows = filtered.slice(sliceStart, sliceStart + ROWS_PER_PAGE);

    // Copilot readable data
    useCopilotReadable({
        description: "All user transactions",
        value: transactions
    });
    useCopilotReadable({
        description: "Transactions after filters",
        value: filtered
    });

    // Loading state
    if (userLoading || txLoading || statusLoading || catLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <HeaderBox title="Transactions" subtext="Manage and view your transaction history" />

            <div className="transaction-filter-wrapper mt-6">
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
                        updateQueryParams('category', v === 'All Categories' ? '' : v);
                    }}
                    availableCategories={availableCategories}

                    dateFilter={dateFilter}
                    setDateFilter={(range) => {
                        setDateFilter(range);
                        setHasSearched(true);
                        const dateParam = range.from && range.to
                            ? `${range.from.toISOString()}_${range.to.toISOString()}`
                            : range.from
                                ? range.from.toISOString()
                                : '';
                        updateQueryParams('date', dateParam);
                    }}

                    selectedStatus={selectedStatus}
                    setSelectedStatus={(v) => {
                        setSelectedStatus(v);
                        setHasSearched(true);
                        updateQueryParams('status', v === 'All Statuses' ? '' : v);
                    }}
                    availableStatuses={availableStatuses}

                    transactionType={transactionType}
                    setTransactionType={(v) => {
                        setTransactionType(v);
                        setHasSearched(true);
                        updateQueryParams('transactionType', v === 'Incoming & Outgoing' ? '' : v);
                    }}
                    availableTransactionTypes={['Incoming & Outgoing', 'incoming', 'outgoing']}
                />
            </div>

            <section className="mt-6 flex flex-col gap-6">
                {filtered.length === 0 && hasSearched ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-2">No transactions found</div>
                        <p className="text-sm text-gray-400">
                            Try adjusting your filters to see more results.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-sm border">
                            <TransactionTable
                                transactions={currentRows}
                                categories={categories}
                                statuses={statuses}
                            />
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center">
                                <Pagination page={currentPage} totalPages={totalPages} />
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
