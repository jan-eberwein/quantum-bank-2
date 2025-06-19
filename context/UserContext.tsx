"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { usePathname } from "next/navigation";
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
    const [loading, setLoading] = useState(false); // Start with false, only set to true when actually fetching
    const pathname = usePathname();

    // Check if we're on an authentication page
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    const refreshUser = useCallback(async (silent: boolean = false) => {
        // Don't fetch user data if we're on an auth page and it's an automatic fetch
        if (isAuthPage && silent === false) {
            setLoading(false);
            return;
        }

        if (!silent) setLoading(true);
        try {
            const profile = await getCurrentUserProfile();
            setUser(profile);
        } catch (err: any) {
            // Only log errors if we're not on auth pages (where 401s are expected)
            if (!isAuthPage) {
                console.error("refreshUser error:", err);
            }
            setUser(null);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [isAuthPage]);

    useEffect(() => {
        // Only auto-fetch user data if we're NOT on an authentication page
        if (!isAuthPage) {
            void refreshUser();
        } else {
            // On auth pages, just set loading to false and user to null
            setLoading(false);
            setUser(null);
        }
    }, [refreshUser, isAuthPage]);

    return (
        <UserContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);