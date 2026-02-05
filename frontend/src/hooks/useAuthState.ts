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
      const { data: userData, error } = await supabase()
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      console.log('Fetched user data:', userData);
      return userData as User || null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase().auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError(sessionError);
            setLoading(false);
          }
          return;
        }

        console.log('Initial session:', session?.user?.email);

        if (mounted && session?.user) {
          const userData = await fetchUserData(session.user.id);
          console.log('Setting user:', userData);
          setUser(userData);
        }

        if (mounted) setLoading(false);
      } catch (err) {
        console.error('Auth state error:', err);
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase().auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (!mounted) return;

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          console.log('Setting user from auth state change:', userData);
          setUser(userData);
        } else {
          console.log('No session, setting user to null');
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
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
