// hooks/useTransactionCategories.ts
import { useState, useEffect } from "react";
import { database } from "@/lib/appwrite";

export default function useTransactionCategories() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env
                        .NEXT_PUBLIC_APPWRITE_TRANSACTION_CATEGORIES_COLLECTION_ID!
                );
                // assume each doc has a `name` field
                setCategories(res.documents.map((d) => (d as any).name));
            } catch (err: any) {
                setError(err.message || "Could not load categories");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return { categories, loading, error };
}
