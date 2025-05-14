"use client";

import React, { useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(""); // Only used for sign-up
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

        await account.create(sanitizedUserId, email, password, userId);
        await account.createEmailPasswordSession(email, password);
        router.push("/");
      } else {
        await account.createEmailPasswordSession(email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form space-y-4">
      <div className="form-item">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-item">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
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

      {error && <p className="form-message">{error}</p>}

      <Button type="submit" className="form-btn w-full">
        {type === "sign-up" ? "Sign Up" : "Sign In"}
      </Button>
    </form>
  );
};

export default AuthForm;
