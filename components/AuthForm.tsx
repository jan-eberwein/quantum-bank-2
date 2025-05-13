"use client";

import React, { useState } from "react";
import { account } from "@/lib/appwrite"; // Import Appwrite account object
import { useRouter } from "next/navigation"; // Import from next/navigation instead of next/router
import { Input } from "@/components/ui/input"; // Using your custom Input component
import { Button } from "@/components/ui/button"; // Using your custom Button component
import { Label } from "@/components/ui/label"; // Using your custom Label component

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(""); // Manage userId here
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Call useRouter directly here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Sanitize userId
      const sanitizedUserId = userId
        .trim() // Trim any leading/trailing whitespace
        .replace(/[^a-zA-Z0-9.-_]/g, "") // Remove invalid characters
        .slice(0, 36); // Limit to 36 characters

      // Validate userId
      if (!sanitizedUserId || /^[^a-zA-Z0-9]/.test(sanitizedUserId)) {
        throw new Error("Invalid userId: Must contain only alphanumeric characters, periods, hyphens, and underscores, and can't start with a special character.");
      }

      // Create account
      if (type === "sign-up") {
        await account.create(sanitizedUserId, email, password, userId);
        router.push("/"); // Redirect to dashboard after successful registration
      } else {
        // Sign in the user
        await account.createSession(email, password);
        router.push("/"); // Redirect to dashboard after successful login
      }
    } catch (err: any) {
      setError(err.message); // Display error message
    }
  };

  return (
    <div className="auth-form">
      <h1 className="text-24 font-semibold">{type === "sign-in" ? "Sign In" : "Sign Up"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="form-item">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-class"
          />
        </div>

        <div className="form-item">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-class"
          />
        </div>

        {type === "sign-up" && (
          <div className="form-item">
            <Label>Username (userId)</Label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="input-class"
            />
          </div>
        )}

        {error && <p className="form-message">{error}</p>}

        <Button type="submit" className="form-btn">{type === "sign-in" ? "Log In" : "Register"}</Button>
      </form>
    </div>
  );
};

export default AuthForm;
