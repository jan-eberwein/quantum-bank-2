"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { account } from "@/lib/appwrite";

interface ClientAuthCheckProps {
    children: React.ReactNode;
}

const ClientAuthCheck: React.FC<ClientAuthCheckProps> = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthPage) {
                setIsChecking(false);
                return;
            }

            try {
                await account.get();
                // User is authenticated, continue
                setIsChecking(false);
            } catch (error) {
                // Not authenticated, redirect to sign-in
                router.push('/sign-in');
            }
        };

        checkAuth();
    }, [pathname, isAuthPage, router]);

    if (isChecking && !isAuthPage) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ClientAuthCheck;