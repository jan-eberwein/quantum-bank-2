// hooks/useTransactions.ts
import { useEffect, useState } from 'react';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';

export type Transaction = {
  $id: string;
  merchant: string;
  description: string;
  transactionStatusId: string;
  transactionCategoryId: string;
  amount: number;
  createdAt: string;
};

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
        // NOTE: Query on "userId" (which you showed in your Appwrite Attributes screenshot).
        console.log("trying to fetch transactions for userId:", userId);
        const res = await database.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
            [Query.equal('userId', userId)]
        );

        // Map exactly the fields your collection has:
        const mapped: Transaction[] = res.documents.map((doc: any) => ({
          $id: doc.$id,
          merchant: doc.merchant,
          description: doc.description,
          transactionStatusId: doc.transactionStatusId,
          transactionCategoryId: doc.transactionCategoryId,
          amount: doc.amount,
          createdAt: doc.$createdAt, // use $createdAt or doc.createdAt if you stored a separate "createdAt"
        }));

        setTransactions(mapped);
      } catch (err: any) {
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
