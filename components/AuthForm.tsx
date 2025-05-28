"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signUpAndCreateProfile, signIn } from "@/lib/auth";
import { useUser } from "@/context/UserContext";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(""); // used for sign-up only
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { refreshUser } = useUser();

  const validateEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (type === "sign-up") {
        const sanitizedUserId = userId
            .trim()
            .replace(/[^a-zA-Z0-9._-]/g, "")
            .slice(0, 36);

        if (!sanitizedUserId || /^[^a-zA-Z0-9]/.test(sanitizedUserId)) {
          throw new Error(
              "Invalid userId: Must contain only alphanumeric characters, periods, hyphens, and underscores, and can't start with a special character."
          );
        }

        await signUpAndCreateProfile(sanitizedUserId, email, password);
      } else {
        await signIn(email, password);
      }

      // Refresh global user context now that authentication has succeeded
      await refreshUser();

      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    }
  };

  return (
      <section className="auth-form">
        <header className="flex flex-col gap-5 md:gap-8 items-center">
          <Link href="/" className="cursor-pointer flex items-center gap-1">
            <Image
                src="/icons/QuantumLogo.png"
                width={400}
                height={280}
                alt="Quantum logo"
            />
          </Link>

          <div className="flex flex-col gap-1 md:gap-3 text-center">
            <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
              {type === "sign-in" ? "Sign In" : "Sign Up"}
            </h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="form-item">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
            />
          </div>

          <div className="form-item">
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
            />
          </div>

          {type === "sign-up" && (
              <div className="form-item">
                <Label htmlFor="userId">User ID (for internal use)</Label>
                <Input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g., jan-eberwein"
                    required
                />
              </div>
          )}

          {error && <p className="form-message text-red-600">{error}</p>}

          <Button type="submit" className="form-btn w-full">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <footer className="flex justify-center gap-1 mt-4">
          <p className="text-14 font-normal text-gray-600">
            {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
          </p>
          <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link text-blue-600 hover:underline"
          >
            {type === "sign-in" ? "Sign up" : "Sign in"}
          </Link>
        </footer>
      </section>
  );
};

export default AuthForm;
