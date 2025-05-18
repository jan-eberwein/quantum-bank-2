"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account, database } from "@/lib/appwrite";
import { UserProfile } from "@/types/User";
import { getCurrentUserProfile } from "@/lib/user";

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        setLoading(true);
        const profile = await getCurrentUserProfile();
        setUser(profile);
        setLoading(false);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
