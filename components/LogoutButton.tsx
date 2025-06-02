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
    await signOut();
    router.push('/sign-in');
  };

  return (
    <Button onClick={handleLogout} className="text-sm">
      Logout
    </Button>
  );
};

export default LogoutButton;
