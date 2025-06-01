'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import useTransactions from '@/hooks/useTransactions';
import useTransactionCategories from '@/hooks/useTransactionCategories';
import useTransactionStatuses from '@/hooks/useTransactionStatuses';
import TransactionTable from '@/components/TransactionTable';

const LastTransactionsWidget = () => {
    const router = useRouter();
    const { user } = useUser();
    const { transactions, loading: transactionsLoading } = useTransactions(user?.$id);
    const { categories, loading: categoriesLoading } = useTransactionCategories();
    const { statuses, loading: statusesLoading } = useTransactionStatuses();

    // Check if we're still loading any required data
    const isLoading = transactionsLoading || categoriesLoading || statusesLoading;

    // Get the 5 most recent transactions
    const lastTransactions = React.useMemo(() => {
        if (!transactions.length) return [];

        return [...transactions]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [transactions]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="last-transactions-widget border p-4 rounded-lg shadow-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                </div>
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading transactions...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty state if no transactions (matching the main transactions page style)
    if (!lastTransactions.length) {
        return (
            <div className="last-transactions-widget border p-4 rounded-lg shadow-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                    <button
                        onClick={() => router.push('/transactions')}
                        className="text-sm font-medium text-blue-500 hover:underline"
                    >
                        View all
                    </button>
                </div>
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">No transactions found</div>
                    <p className="text-sm text-gray-400">
                        Your recent transactions will appear here once you start making them.
                    </p>
                </div>
            </div>
        );
    }

    // Show transactions
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

            {/* Only render the table if we have all the required data */}
            {categories.length > 0 && statuses.length > 0 ? (
                <TransactionTable
                    transactions={lastTransactions}
                    categories={categories}
                    statuses={statuses}
                    dateFormat="short"
                    showStatus={false}
                />
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">Loading transaction details...</div>
                    <p className="text-sm text-gray-400">
                        Please wait while we load the transaction information.
                    </p>
                </div>
            )}
        </div>
    );
};

export default LastTransactionsWidget;