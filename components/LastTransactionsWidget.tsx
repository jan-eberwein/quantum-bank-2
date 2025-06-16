'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';
import useTransactionCategories from '@/hooks/useTransactionCategories';
import useTransactionStatuses from '@/hooks/useTransactionStatuses';
import TransactionTable from '@/components/TransactionTable';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Transaction, isTransaction } from '@/types/Transaction';

interface LastTransactionsWidgetProps {
    refreshKey?: number;
}

const LastTransactionsWidget = ({ refreshKey = 0 }: LastTransactionsWidgetProps) => {
    const router = useRouter();
    const { user } = useUser();
    const { categories, loading: categoriesLoading } = useTransactionCategories();
    const { statuses, loading: statusesLoading } = useTransactionStatuses();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    // Fetch transactions with refresh trigger
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user?.$id) {
                setTransactions([]);
                setTransactionsLoading(false);
                return;
            }

            setTransactionsLoading(true);
            try {
                const res = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
                    [
                        Query.equal('userId', user.$id),
                        Query.orderDesc('createdAt'),
                        Query.limit(1000)
                    ]
                );

                const mapped: Transaction[] = res.documents
                    .map((doc: any) => ({
                        $id: doc.$id,
                        userId: doc.userId,
                        amount: doc.amount,
                        createdAt: doc.createdAt,
                        merchant: doc.merchant,
                        description: doc.description || '',
                        transactionStatusId: doc.transactionStatusId,
                        transactionCategoryId: doc.transactionCategoryId,
                        $createdAt: doc.$createdAt,
                        $updatedAt: doc.$updatedAt,
                    }))
                    .filter(isTransaction);

                setTransactions(mapped);
            } catch (err) {
                console.error('Error fetching transactions:', err);
            } finally {
                setTransactionsLoading(false);
            }
        };

        fetchTransactions();
    }, [user?.$id, refreshKey]);

    // Check if we're still loading any required data
    const isLoading = transactionsLoading || categoriesLoading || statusesLoading;

    // Get the 4 most recent transactions (reduced from 5)
    const lastTransactions = React.useMemo(() => {
        if (!transactions.length) return [];

        return [...transactions]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
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