'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated import

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock User Data (vorher definieren)
const MOCK_USERS = [
  { email: 'jan@quantum.com', password: 'password', name: 'Jan Eberwein' },
  { email: 'johannes@quantum.com', password: 'password', name: 'Johannes Eder' },
  { email: 'johnny@quantum.com', password: 'password', name: 'Johnny Eder' },
];

const AuthForm = ({ type }: { type: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'sign-up') {
      if (!email) {
        setError('Email ist erforderlich');
        return;
      }

      if (!validateEmail(email)) {
        setError('Ungültige Email-Adresse');
        return;
      }

      if (password.length < 6) {
        setError('Passwort muss mindestens 6 Zeichen haben');
        return;
      }

      alert('Registrierung erfolgreich!');
    } else if (type === 'sign-in') {
      const userMatch = MOCK_USERS.find(
        (user) => user.email === email && user.password === password
      );

      if (userMatch) {
        router.push('/'); // Redirect to root page
      } else {
        setError('Login fehlgeschlagen.');
      }
    }
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image
            src="/icons/QuantumLogo.png"
            width={400}
            height={280}
            alt="Quantum logo"
          />
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit" className="w-full">
          {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>

      <footer className="flex justify-center gap-1 mt-4">
        <p className="text-14 font-normal text-gray-600">
          {type === 'sign-in'
            ? "Don't have an account?"
            : 'Already have an account?'}
        </p>
        <Link
          href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
          className="form-link"
        >
          {type === 'sign-in' ? 'Sign up' : 'Sign in'}
        </Link>
      </footer>
    </section>
  );
};

export default AuthForm;
