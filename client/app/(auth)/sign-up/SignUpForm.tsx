/*"use client";

import { useState } from "react";
import { useSignup } from "@/app/api/auth/hooks";

export default function SignupForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const signupMutation = useSignup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        signupMutation.mutate({ username, email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="border p-2 w-full"
            />
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
                disabled={signupMutation.isLoading}
                className="bg-blue-500 text-white p-2 rounded"
            >
                {signupMutation.isLoading ? "Signing up..." : "Sign Up"}
            </button>
            {signupMutation.isError && (
                <p className="text-red-500">{signupMutation.error.message}</p>
            )}
        </form>
    );
}
*/