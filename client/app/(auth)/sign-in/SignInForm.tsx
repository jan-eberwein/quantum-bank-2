import React, { useState } from "react";

export default function SignInForm({
                                       onSubmit,
                                   }: {
    onSubmit: (email: string, password: string) => Promise<void>;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await onSubmit(email, password);
        } catch (err: any) {
            setError(err.message || "Failed to log in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-2 w-full"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border p-2 w-full"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded text-white ${
                    loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}


/*"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SigninForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loginUser } = useAuth();

    // Local state for loading and error handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setLoading(true); // Set loading state

        try {
            await loginUser(email, password);
        } catch (err) {
            console.error("Login failed:", err.message);
            setError(err.message || "Failed to log in. Please try again.");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-2 w-full"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border p-2 w-full"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded text-white ${
                    loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}*/


/*"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SigninForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loginUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await loginUser(email, password);
        } catch (error) {
            console.error("Login failed:", error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-2 w-full"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border p-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Sign In
            </button>
        </form>
    );
}
*/

/*"use client";

import { useState } from "react";
import { useLogin } from "@/lib/react-query/queriesAndMutations";

export default function SigninForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const loginMutation = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-2 w-full"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border p-2 w-full"
            />
            <button
                type="submit"
                disabled={loginMutation.isLoading}
                className="bg-blue-500 text-white p-2 rounded"
            >
                {loginMutation.isLoading ? "Signing in..." : "Sign In"}
            </button>
            {loginMutation.isError && (
                <p className="text-red-500">{loginMutation.error.message}</p>
            )}
        </form>
    );
}
*/

