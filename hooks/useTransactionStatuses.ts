// hooks/useTransactionStatuses.ts
import { useState, useEffect } from "react";
import { database } from "@/lib/appwrite";

export default function useTransactionStatuses() {
    const [statuses, setStatuses] = useState<string[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTION_STATUSES_COLLECTION_ID!
                );
                // assume each doc has a `name` field
                setStatuses(res.documents.map((d) => (d as any).name));
            } catch (err: any) {
                setError(err.message || "Failed to load statuses");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { statuses, loading, error };
}
