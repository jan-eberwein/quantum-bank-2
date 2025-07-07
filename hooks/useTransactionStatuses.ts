import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { database } from "@/lib/appwrite";
import { TransactionStatus, isTransactionStatus } from "@/types/Transaction";

export default function useTransactionStatuses() {
    const [statuses, setStatuses] = useState<TransactionStatus[]>([]);
    const [loading, setLoading] = useState(false); // Start with false
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();

    // Check if we're on an authentication page
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    useEffect(() => {
        const fetchStatuses = async () => {
            // Don't fetch data on auth pages
            if (isAuthPage) {
                setStatuses([]);
                setLoading(false);
                setError(null);
                return;
            }

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
                setError(null);
            } catch (err: any) {
                // Only log/set errors if not on auth pages and not authentication errors
                if (!isAuthPage && !err.message?.includes('missing scope') && !err.message?.includes('guests')) {
                    console.error('Error fetching transaction statuses:', err);
                    setError(err.message || "Failed to load statuses");
                } else {
                    setStatuses([]);
                    setError(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStatuses();
    }, [isAuthPage]);

    return { statuses, loading, error };
}