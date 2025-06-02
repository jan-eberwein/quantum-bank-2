import { useState, useEffect } from 'react';
import { database } from '@/lib/appwrite';
import { Query } from 'appwrite';

export interface UserForTransfer {
    $id: string;
    userId: string;
    email: string;
}

export function useAllUsers() {
    const [users, setUsers] = useState<UserForTransfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
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
            } catch (err: any) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
}