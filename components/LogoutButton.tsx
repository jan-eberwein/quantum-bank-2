'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
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
