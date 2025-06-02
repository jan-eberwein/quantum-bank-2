// components/Sidebar.tsx
"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserCard from "./UserCard";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useEnhancedCopilotActions } from "@/lib/copilot-actions";
import { format } from "date-fns";
import { signOut } from "@/lib/auth";

// Dynamically import CopilotUI so it only renders on the client
const CopilotUI = dynamic(() => import("./CopilotUI"), { ssr: false });

interface SidebarProps {
    user: { [key: string]: any } | null;
}

const Sidebar = ({ user }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();

    // Initialize enhanced Copilot actions
    useEnhancedCopilotActions();

    useCopilotReadable({
        description: "The available pages/parts of the application",
        value: sidebarLinks,
    });

    useCopilotReadable({
        description: "The currently signed in user",
        value: user,
    });

    useCopilotReadable({
        description: "Current page/route information",
        value: {
            currentPath: pathname,
            availableRoutes: sidebarLinks.map(link => ({
                route: link.route,
                label: link.label,
                isActive: pathname === link.route || pathname.startsWith(`${link.route}/`)
            }))
        },
    });

    // Get the current date and format it as needed
    const currentDate = format(new Date(), "yyyy-MM-dd");

    // Make the current date readable by Copilot
    useCopilotReadable({
        description: "The current date in yyyy-MM-dd format",
        value: currentDate,
    });

    // Define Copilot action for navigation
    useCopilotAction({
        name: "navigate",
        description: "Navigate to another route in the application",
        parameters: [
            {
                name: "routeName",
                type: "string",
                description: "The route to navigate to (e.g., '/', '/transactions', '/settings')",
                required: true,
            },
        ],
        handler: async ({ routeName }) => {
            if (!routeName || typeof routeName !== "string") {
                console.error("Invalid routeName provided");
                return;
            }
            try {
                await router.push(routeName);
            } catch (error) {
                console.error("Failed to navigate to the route:", error);
            }
        },
    });

    // Enhanced navigation with semantic understanding
    useCopilotAction({
        name: "goToSection",
        description: "Navigate to a specific section or page by name",
        parameters: [
            {
                name: "sectionName",
                type: "string",
                description: "Section name: 'home', 'dashboard', 'transactions', 'settings', 'account'",
                required: true,
            },
        ],
        handler: async ({ sectionName }) => {
            const section = sectionName.toLowerCase().trim();
            const routeMap: { [key: string]: string } = {
                'home': '/',
                'dashboard': '/',
                'main': '/',
                'start': '/',
                'transactions': '/transactions',
                'transaction history': '/transactions',
                'payments': '/transactions',
                'settings': '/settings',
                'account': '/settings',
                'profile': '/settings',
                'preferences': '/settings',
            };

            const route = routeMap[section];
            if (route) {
                router.push(route);
            } else {
                console.warn("Unknown section:", sectionName);
            }
        },
    });

    // Application state query
    useCopilotAction({
        name: "getApplicationState",
        description: "Get information about the current application state",
        handler: async () => {
            return {
                currentPage: pathname,
                user: user ? {
                    id: user.$id,
                    username: user.userId,
                    email: user.email,
                    balance: user.balance ? user.balance / 100 : 0,
                } : null,
                availablePages: sidebarLinks.map(link => link.label),
                currentDate,
            };
        },
    });

    // Quick actions
    useCopilotAction({
        name: "openTransactions",
        description: "Open the transactions page",
        handler: async () => {
            router.push("/transactions");
        },
    });

    useCopilotAction({
        name: "openSettings",
        description: "Open the account settings page",
        handler: async () => {
            router.push("/settings");
        },
    });

    useCopilotAction({
        name: "goHome",
        description: "Navigate to the home/dashboard page",
        handler: async () => {
            router.push("/");
        },
    });

    // Handle logout events
    useEffect(() => {
        const handleLogout = async () => {
            try {
                await signOut();
                router.push('/sign-in');
            } catch (error) {
                console.error('Logout failed:', error);
            }
        };

        window.addEventListener('copilot-logout', handleLogout);

        return () => {
            window.removeEventListener('copilot-logout', handleLogout);
        };
    }, [router]);

    return (
        <section className="sidebar flex flex-col h-full">
            <nav className="flex flex-col gap-4">
                {/* Logo */}
                <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
                    <div className="w-full max-w-[400px] mx-auto hidden sm:block lg:hidden">
                        <Image
                            src="/icons/QuantumLogo_small.png"
                            layout="responsive"
                            width={16}
                            height={9}
                            alt="Quantum small logo"
                            className="sidebar-logo-tablet"
                        />
                    </div>
                    <div className="w-full max-w-[400px] mx-auto hidden lg:block">
                        <Image
                            src="/icons/QuantumLogo.png"
                            layout="responsive"
                            width={16}
                            height={9}
                            alt="Quantum logo"
                            className="sidebar-logo"
                        />
                    </div>
                </Link>

                {/* Navigation Links */}
                {sidebarLinks.map((item) => {
                    const isActive =
                        pathname === item.route || pathname.startsWith(`${item.route}/`);

                    return (
                        <Link
                            href={item.route}
                            key={item.label}
                            className={cn(
                                "sidebar-link flex items-center gap-2 p-3 rounded-lg transition-colors",
                                { "bg-bank-gradient text-white": isActive }
                            )}
                        >
                            <div className="relative size-6">
                                <Image
                                    src={item.imgURL}
                                    alt={item.label}
                                    fill
                                    className={cn("brightness-0", {
                                        "brightness-[3] invert-0": isActive,
                                    })}
                                />
                            </div>
                            <p
                                className={cn("sidebar-label text-gray-700", {
                                    "!text-white": isActive,
                                })}
                            >
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </nav>

            {/* Render CopilotUI only on the client */}
            <CopilotUI />

            <UserCard />
        </section>
    );
};

export default Sidebar;