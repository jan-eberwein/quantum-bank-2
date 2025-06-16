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
    console.log("useBalance: Recalculating balance with", transactions.length, "transactions, refreshKey:", refreshKey);
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, refreshKey]);

  console.log("useBalance: Current balance is", balance, "cents");
  return { balance, loading };
}