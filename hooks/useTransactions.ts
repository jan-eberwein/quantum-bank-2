import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Transaction, isTransaction } from '@/types/Transaction';

const useTransactions = (userId: string | undefined, refreshKey: number = 0) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Start with false
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();

    // Check if we're on an authentication page
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    useEffect(() => {
        const fetchTransactions = async () => {
            // Don't fetch data on auth pages or if no userId
            if (isAuthPage || !userId) {
                setTransactions([]);
                setLoading(false);
                setError(null);
                return;
            }

            // Only show loading spinner on initial load, not on refreshes
            if (transactions.length === 0) {
                setLoading(true);
            }

            try {
                const res = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
                    [
                        Query.equal('userId', userId),
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
                setError(null);
            } catch (err: any) {
                // Only log/set errors if not on auth pages and not authentication errors
                if (!isAuthPage && !err.message?.includes('missing scope') && !err.message?.includes('guests')) {
                    console.error('Error fetching transactions:', err);
                    setError(err.message || 'Failed to fetch transactions');
                } else {
                    setTransactions([]);
                    setError(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [userId, refreshKey, isAuthPage]); // Include isAuthPage in dependencies

    return { transactions, loading, error };
};

export default useTransactions;