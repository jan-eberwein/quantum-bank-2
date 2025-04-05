"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/sign-in"); // Redirect to sign-in page if not authenticated
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return <div>Loading...</div>; // Optionally show a loading state
    }

    return (
        <main className="flex h-screen w-full font-inter">
            {children}
        </main>
    );
}



/*"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/sign-in"); // Redirect to the sign-in page
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        // Optionally show a loading spinner while redirecting
        return <div>Loading...</div>;
    }

    return (
        <main className="flex h-screen w-full font-inter">
            {children}
        </main>
    );
}*/



/*"use client"

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  const { user, logoutUser } = useAuth();

  const loggedIn = { firstName: 'Jan', lastName: 'Eberwein' }

  return (
    <main className="flex h-screen w-full font-inter">
      <h1>Welcome {user?.email}</h1>
      <Sidebar user={loggedIn} />
      {children}
    </main>
  );
}
*/