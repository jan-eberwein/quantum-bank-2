/*"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/api/authApi";
import { ApiResponse, User } from "@/types"; // Import your predefined types

// Define the AuthContext type
interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");

        if (storedToken) {
            // Validate the token and fetch user profile
            fetch("/api/users/me", {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error("Invalid token");
                })
                .then((data) => {
                    setUser(data);
                    setToken(storedToken);
                })
                .catch(() => {
                    localStorage.removeItem("authToken");
                    setUser(null);
                    setToken(null);
                });
        }
    }, []);


    // Function to handle user login
    const loginUser = async (email: string, password: string) => {
        try {
            const response: ApiResponse<{ token: string }> = await login(email, password);
            const { token } = response.data;

            setToken(token);
            localStorage.setItem("authToken", token);

            // Fetch and set user data after successful login
            // Replace this mock user data with a real user fetch if needed
            const userData: User = {
                userId: 1, // Replace with fetched data
                username: "MockUser", // Replace with fetched data
                email: email,
                createdAt: new Date().toISOString(),
            };

            setUser(userData);
            router.push("/dashboard"); // Redirect after login
        } catch (error) {
            console.error("Failed to log in:", error);
            throw error; // Rethrow for error handling in consuming components
        }
    };

    // Function to handle user logout
    const logoutUser = () => {
        logout(); // Clear token and optional server-side logout
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
        router.push("/login"); // Redirect to login page
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use the AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};



/*'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { IUser, IContextType } from "@/types";
import { getCurrentUser } from "@/lib/api";

export const INITIAL_USER = {
    id: "",
    name: "",
    username: "",
    email: "",
    imageUrl: "",
    bio: "",
};

const INITIAL_STATE = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const checkAuthUser = async () => {
        setIsLoading(true);
        try {
            const currentAccount = await getCurrentUser();
            if (currentAccount) {
                setUser({
                    id: currentAccount.id,
                    name: currentAccount.name,
                    username: currentAccount.username,
                    email: currentAccount.email,
                    imageUrl: currentAccount.imageUrl,
                    bio: currentAccount.bio,
                });
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const cookieFallback = localStorage.getItem("cookieFallback");
        if (
            cookieFallback === "[]" ||
            cookieFallback === null
        ) {
            router.push('/sign-in');
        }

        checkAuthUser();
    }, []);

    const value = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);

*/

/*"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/api/authApi";
import { ApiResponse, User } from "@/types";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
            fetch("/api/users/me", {
                headers: { Authorization: `Bearer ${storedToken}` },
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error("Invalid token");
                })
                .then((data) => {
                    setUser(data);
                })
                .catch(() => {
                    localStorage.removeItem("authToken");
                    setUser(null);
                    setToken(null);
                });
        }
    }, []);

    const loginUser = async (email: string, password: string) => {
        try {
            console.log("Attempting login...");

            const response: ApiResponse<{ token: string }> = await login({ email, password });

            console.log("Login response:", response);
            const { token } = response;
            console.log("Token received:", token);

            if (!token) {
                throw new Error("No token returned from login API");
            }

            setToken(token);
            localStorage.setItem("authToken", token);

            const userData: User = await fetch("/api/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
                if (!res.ok) throw new Error("Failed to fetch user data");
                return res.json();
            });
            console.log("User data fetched:", userData);

            setUser(userData);
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to log in:", error);
            throw error;
        }
    };

    const logoutUser = () => {
        logout();
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
        router.push("/sign-in");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
*/

/*"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/api/authApi";
import { useFetchLoggedInUser } from "@/lib/react-query/queriesAndMutations";
import { ApiResponse, User } from "@/types";

// Define the AuthContext Type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for token management
const saveTokenToStorage = (token: string) => localStorage.setItem("authToken", token);
const getTokenFromStorage = () => localStorage.getItem("authToken");
const removeTokenFromStorage = () => localStorage.removeItem("authToken");

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // Fetch the currently logged-in user using React Query
    const { data, isLoading, isError, refetch } = useFetchLoggedInUser(token || "");

    // Set the user whenever React Query fetches fresh user data
    useEffect(() => {
        if (data?.data) {
            setUser(data.data);
        } else if (isError) {
            // Clear the token if user fetch fails
            removeTokenFromStorage();
            setToken(null);
            setUser(null);
        }
    }, [data, isError]);

    // Load the token from storage on initial render
    useEffect(() => {
        const storedToken = getTokenFromStorage();
        if (storedToken) {
            setToken(storedToken);
            refetch(); // Trigger React Query to fetch the user
        }
    }, [refetch]);

    // Login Function
    const loginUser = async (email: string, password: string) => {
        try {
            const response: ApiResponse<{ token: string }> = await login({ email, password });
            const { token } = response.data;

            if (!token) throw new Error("No token returned from login API");

            // Save token and trigger user refetch
            saveTokenToStorage(token);
            setToken(token);
            await refetch(); // Refetch user data

            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    // Logout Function
    const logoutUser = () => {
        logout(); // Optional API logout call
        removeTokenFromStorage();
        setUser(null);
        setToken(null);
        router.push("/sign-in");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user && !isLoading,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook to Use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
*/

/*"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/api/authApi";
import { fetchLoggedInUser } from "@/lib/api/userApi";
import { User, ApiResponse } from "@/types";

// Define the AuthContext Type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management helpers
const saveTokenToStorage = (token: string) => localStorage.setItem("authToken", token);
const getTokenFromStorage = () => localStorage.getItem("authToken");
const removeTokenFromStorage = () => localStorage.removeItem("authToken");

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // Load the user on initial render if a token exists
    useEffect(() => {
        const storedToken = getTokenFromStorage();
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        }
    }, []);

    // Fetch the logged-in user
    const fetchUser = async (token: string) => {
        try {
            const { data } = await fetchLoggedInUser(token);
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            removeTokenFromStorage();
            setToken(null);
            setUser(null);
        }
    };

    // Login functionality
    const loginUser = async (email: string, password: string) => {
        try {
            const response: ApiResponse<{ token: string }> = await login({ email, password });
            const { token } = response;

            if (!token) throw new Error("No token returned from login API");

            saveTokenToStorage(token);
            setToken(token);

            await fetchUser(token);
            router.push("/");
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Re-throw for component-level error handling
        }
    };

    // Logout functionality
    const logoutUser = () => {
        logout(); // Optional: Inform server of logout
        removeTokenFromStorage();
        setUser(null);
        setToken(null);
        router.push("/sign-in");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
*/

/*"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useLogout, useFetchLoggedInUser } from "@/lib/react-query/queriesAndMutations";
import { User } from "@/types";

// Define the AuthContext Type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const { mutateAsync: login, isLoading: isLoggingIn } = useLogin();
    const { mutateAsync: logout } = useLogout();
    const { data: loggedInUser, refetch } = useFetchLoggedInUser();

    useEffect(() => {
        if (loggedInUser) {
            setUser(loggedInUser.data);
        }
    }, [loggedInUser]);

    const loginUser = async (email: string, password: string) => {
        await login({ email, password });
        await refetch(); // Fetch user data after login
        router.push("/dashboard"); // Redirect to dashboard
    };

    const logoutUser = async () => {
        await logout();
        setUser(null);
        router.push("/sign-in"); // Redirect to sign-in after logout
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
*/

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // Axios instance
import { login, logout } from "@/lib/api/authApi";
import { User, ApiResponse } from "@/types";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getTokenFromStorage = () => localStorage.getItem("authToken");
const saveTokenToStorage = (token: string) => localStorage.setItem("authToken", token);
const removeTokenFromStorage = () => localStorage.removeItem("authToken");

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // On component mount, load the token and fetch the user
    useEffect(() => {
        const storedToken = getTokenFromStorage();
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        }
    }, []);

    const fetchUser = async (token: string) => {
        try {
            const response = await api.get<ApiResponse<User>>("/users/me", {
                headers: { Authorization: `Bearer ${token}` }, // Token explicitly passed here
            });
            setUser(response.data.data); // Set the user state
        } catch (error) {
            console.error("Failed to fetch user:", error);
            handleInvalidSession();
        }
    };

    const handleInvalidSession = () => {
        removeTokenFromStorage();
        setToken(null);
        setUser(null);
        router.push("/sign-in");
    };

    const loginUser = async (email: string, password: string) => {
        try {
            const response: ApiResponse<{ token: string }> = await login({ email, password });
            const { token } = response;

            if (!token) throw new Error("No token returned from login API");

            saveTokenToStorage(token);
            setToken(token);
            await fetchUser(token);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            removeTokenFromStorage();
            setToken(null);
            setUser(null);
            router.push("/sign-in");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
