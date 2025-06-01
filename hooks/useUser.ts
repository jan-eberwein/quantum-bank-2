// hooks/useUser.ts
import { useEffect, useState, useCallback } from "react";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
      setError(null);
    } catch (err: any) {
      console.error("useUser → fetch error:", err);
      setError(err.message || "Failed to fetch user profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // on mount, fetch user profile
    void refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
};

export default useUser;
