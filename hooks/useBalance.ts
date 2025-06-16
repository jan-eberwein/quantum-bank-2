import { useMemo } from "react";
import useTransactions from "./useTransactions";

/**
 * Hook to calculate live account balance based on transactions.
 * Triggers recalculation if `refreshKey` changes.
 */
export default function useBalance(userId?: string, refreshKey: number = 0) {
  // Pass refreshKey to useTransactions to trigger refetch
  const { transactions, loading } = useTransactions(userId, refreshKey);

  const balance = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, refreshKey]);

  return { balance, loading };
}