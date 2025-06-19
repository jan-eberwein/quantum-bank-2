// hooks/useBalance.ts
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import useTransactions from "./useTransactions";

export default function useBalance(userId?: string, refreshKey: number = 0) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  const { transactions, loading } = useTransactions(userId, refreshKey);

  const balance = useMemo(() => {
    // Return 0 if on auth page or no userId
    if (isAuthPage || !userId) return 0;

    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, refreshKey, isAuthPage, userId]);

  return { balance, loading };
}