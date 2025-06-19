// hooks/useUser.ts
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/user";
import type { UserProfile } from "@/types/User";

interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Start with false
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  // Check if we're on an authentication page
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  const refresh = useCallback(async () => {
    // Don't try to fetch user data on auth pages
    if (isAuthPage) {
      setLoading(false);
      setUser(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
      setError(null);
    } catch (err: any) {
      // Only set error if it's not an authentication error
      if (!err.message?.includes('Authentication required')) {
        setError(err.message || "Failed to fetch user profile");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthPage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
};

export default useUser;