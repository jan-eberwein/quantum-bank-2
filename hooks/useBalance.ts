import { useMemo } from "react";
import useTransactions from "./useTransactions";

export default function useBalance(userId?: string, refreshKey: number = 0) {
  const { transactions, loading } = useTransactions(userId, refreshKey);

  const balance = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, refreshKey]);

  return { balance, loading };
}