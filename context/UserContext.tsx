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
     * If `silent` is true, don’t flip the loading spinner.
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

    const refreshUser = useCallback(async (silent: boolean = false) => {
        if (!silent) setLoading(true);
        try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
        } catch (err) {
            console.error("refreshUser error:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        // explicit void to acknowledge we’re intentionally ignoring the Promise
        void refreshUser();
    }, [refreshUser]);

    return (
        <UserContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
