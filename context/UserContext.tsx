"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { account, database } from "@/lib/appwrite";
import { UserProfile } from "@/types/User";
import { getCurrentUserProfile } from "@/lib/user";

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    /**
     * If `silent` is true, don't flip the loading spinner.
     * Otherwise show it.
     */
    refreshUser: (silent?: boolean) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial load function
    const loadUser = async () => {
        setLoading(true);
        try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
        } catch (err) {
            console.error("loadUser error:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = useCallback(async (silent: boolean = false) => {
        if (!silent) setLoading(true);
        try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
        } catch (err) {
            console.error("refreshUser error:", err);
            setUser(null);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Load user on mount only
    useEffect(() => {
        loadUser();
    }, []); // No dependencies needed for initial load

    return (
        <UserContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);