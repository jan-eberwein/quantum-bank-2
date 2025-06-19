// components/LogoutButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

interface LogoutButtonProps {
  stopCardClickPropagation?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ stopCardClickPropagation }) => {
  const router = useRouter();

  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopCardClickPropagation) {
      event.stopPropagation();
    }

    try {
      // Sign out from Appwrite
      await signOut();

      // Clear all cookies related to the session
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      if (projectId) {
        // Clear the main session cookie
        document.cookie = `a_session_${projectId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Clear any other potential session cookies
        document.cookie = `appwrite_session_${projectId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // Force a page refresh to clear any cached state
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to sign-in
      window.location.href = '/sign-in';
    }
  };

  return (
      <Button onClick={handleLogout} className="text-sm">
        Logout
      </Button>
  );
};

export default LogoutButton;