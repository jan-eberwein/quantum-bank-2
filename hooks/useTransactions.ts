import { useEffect, useState } from 'react';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';

const useTransactions = (userId: string | undefined) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!,
          [Query.equal('userId', userId)]
        );

        const mapped = res.documents.map((doc) => ({
          $id: doc.$id,
          name: doc.name,
          accountId: doc.accountId,
          amount: doc.amount,
          pending: doc.pending,
          category: doc.category,
          date: doc.date,
          $createdAt: doc.$createdAt
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
