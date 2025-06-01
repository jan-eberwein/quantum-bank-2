import { useState, useEffect } from "react";
import { database } from "@/lib/appwrite";
import { TransactionStatus, isTransactionStatus } from "@/types/Transaction";

export default function useTransactionStatuses() {
    const [statuses, setStatuses] = useState<TransactionStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatuses = async () => {
            setLoading(true);
            try {
                const res = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTION_STATUSES_COLLECTION_ID!
                );

                // Map and validate response data
                const mapped: TransactionStatus[] = res.documents
                    .map((doc: any) => ({
                        $id: doc.$id,
                        name: doc.name,
                        $createdAt: doc.$createdAt,
                        $updatedAt: doc.$updatedAt,
                    }))
                    .filter(isTransactionStatus);

                setStatuses(mapped);
            } catch (err: any) {
                console.error('Error fetching transaction statuses:', err);
                setError(err.message || "Failed to load statuses");
            } finally {
                setLoading(false);
            }
        };

        fetchStatuses();
    }, []);

    return { statuses, loading, error };
}