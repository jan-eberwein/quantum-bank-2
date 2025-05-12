import { useEffect, useState } from "react";
import apiService from "@/lib/apiService"; // Centralized API service
import { mapTransactionApiToTransaction } from "@/lib/utils";

const useTransactions = (accountId: number) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiTransactions = await apiService.get<TransactionApi[]>(
                    `/transactions/involved/${accountId}`
                );

                // Map API transactions to the local format
                const mappedTransactions: Transaction[] = apiTransactions.map((transaction) =>
                    mapTransactionApiToTransaction(transaction, accountId)
                );

                setTransactions(mappedTransactions);
            } catch (err: any) {
                setError(err?.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (accountId) fetchTransactions();
    }, [accountId]);

    return { transactions, loading, error };
};

export default useTransactions;
