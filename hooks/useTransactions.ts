import { useEffect, useState } from 'react';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Transaction, isTransaction } from '@/types/Transaction';

const useTransactions = (userId: string | undefined) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching transactions for userId:", userId);
        const res = await database.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
            [
              Query.equal('userId', userId),
              Query.orderDesc('createdAt'),
              Query.limit(1000) // Adjust as needed
            ]
        );

        // Map and validate the response data
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
            .filter(isTransaction); // Runtime type validation

        setTransactions(mapped);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  return { transactions, loading, error };
};

export default useTransactions;