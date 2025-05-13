'use client';

import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.warn('Force logout fallback:', error);
    } finally {
      router.push('/sign-in');
    }
  };

  return (
    <Button onClick={handleLogout} className="text-sm">
      Logout
    </Button>
  );
};

export default LogoutButton;
