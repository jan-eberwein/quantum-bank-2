// hooks/useAllUsers.ts
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';

export interface UserForTransfer {
    $id: string;
    userId: string;
    email: string;
}

export function useAllUsers() {
    const [users, setUsers] = useState<UserForTransfer[]>([]);
    const [loading, setLoading] = useState(false); // Start with false
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();

    // Check if we're on an authentication page
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    useEffect(() => {
        const fetchUsers = async () => {
            // Don't fetch data on auth pages
            if (isAuthPage) {
                setUsers([]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            try {
                const response = await database.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                    [
                        Query.select(['$id', 'userId', 'email']),
                        Query.limit(100),
                        Query.orderAsc('userId')
                    ]
                );

                const mappedUsers: UserForTransfer[] = response.documents.map(doc => ({
                    $id: doc.$id,
                    userId: doc.userId || 'Unknown User',
                    email: doc.email || ''
                }));

                setUsers(mappedUsers);
                setError(null);
            } catch (err: any) {
                // Only log/set errors if not on auth pages and not authentication errors
                if (!isAuthPage && !err.message?.includes('missing scope') && !err.message?.includes('guests')) {
                    console.error('Error fetching users:', err);
                    setError('Failed to load users');
                } else {
                    setUsers([]);
                    setError(null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAuthPage]);

    return { users, loading, error };
}