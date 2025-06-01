import { useState, useEffect } from "react";
import { database } from "@/lib/appwrite";
import { TransactionCategory, isTransactionCategory } from "@/types/Transaction";

export default function useTransactionCategories() {
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const res = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTION_CATEGORIES_COLLECTION_ID!
                );

                // Map and validate response data
                const mapped: TransactionCategory[] = res.documents
                    .map((doc: any) => ({
                        $id: doc.$id,
                        name: doc.name,
                        $createdAt: doc.$createdAt,
                        $updatedAt: doc.$updatedAt,
                    }))
                    .filter(isTransactionCategory);

                setCategories(mapped);
            } catch (err: any) {
                console.error('Error fetching transaction categories:', err);
                setError(err.message || "Could not load categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}