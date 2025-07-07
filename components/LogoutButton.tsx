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
      await signOut();

      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      if (projectId) {
        document.cookie = `a_session_${projectId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `appwrite_session_${projectId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }

      // Force page refresh to clear any cached state
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
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