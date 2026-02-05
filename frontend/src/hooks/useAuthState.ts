import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase().auth.getSession();

        if (session?.user) {
          // Fetch user data from Supabase
          const { data: userData } = await supabase()
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser(userData as User || null);
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
          // Fetch user data from Supabase
          const { data: userData } = await supabase()
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser(userData as User || null);
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
  };
}
