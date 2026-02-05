import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch user data
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: userData } = await supabase()
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      return userData as User || null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase().auth.getSession();

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          setUser(userData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth state error:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase().auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          setUser(userData);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // Mutate function to refresh user data
  const mutate = useCallback(async () => {
    const { data: { session } } = await supabase().auth.getSession();

    if (session?.user) {
      const userData = await fetchUserData(session.user.id);
      setUser(userData);
    } else {
      setUser(null);
    }
  }, [fetchUserData]);

  return {
    user,
    loading,
    error,
    mutate,
  };
}
