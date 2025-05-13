import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser({
          $id: currentUser.$id,
          email: currentUser.email,
          userId: currentUser.$id,
          firstName: currentUser.name?.split(' ')[0] || '',
          lastName: currentUser.name?.split(' ')[1] || '',
          city: '',
          address1: '',
          state: '',
          postalCode: '',
          dateOfBirth: '',
          ssn: '',
          dwollaCustomerUrl: '',
          dwollaCustomerId: ''
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};

export default useUser;
