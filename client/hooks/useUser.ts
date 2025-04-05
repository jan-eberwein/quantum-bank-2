import { useEffect, useState } from "react";
import apiService from "@/lib/apiService"; // Centralized API service

const useUser = () => {
    const [user, setUser] = useState<UserApi | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);

            try {
                const userData = await apiService.get<UserApi>(`/users/me`);
                setUser(userData);
            } catch (err: any) {
                setError(err?.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading, error };
};

export default useUser;
