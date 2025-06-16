import { useEffect, useMemo, useState } from "react";
import useTransactions from "./useTransactions";

/**
 * Hook to calculate live account balance based on transactions.
 * Triggers recalculation if `refreshKey` changes.
 */
export default function useBalance(userId?: string, refreshKey: number = 0) {
  const [internalKey, setInternalKey] = useState(0);

  // Force re-fetch or re-evaluation if refreshKey changes
  useEffect(() => {
    setInternalKey(refreshKey);
  }, [refreshKey]);

  const { transactions, loading } = useTransactions(userId);

  const balance = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, internalKey]);

  return { balance, loading };
}
