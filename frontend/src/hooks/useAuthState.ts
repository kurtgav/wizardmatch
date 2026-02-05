import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';
import { User as SupabaseUser } from '@supabase/supabase-js';

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

      console.log('Fetched user data from DB:', userData);
      return userData as User || null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  // Convert Supabase Auth user to our User type
  const convertAuthUser = useCallback((authUser: SupabaseUser): User => {
    // Extract name from metadata or email
    const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || authUser.email?.split('@')[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: authUser.id,
      email: authUser.email || '',
      username: null,
      firstName,
      lastName,
      studentId: '',
      program: '',
      yearLevel: 1,
      gender: '',
      seekingGender: '',
      surveyCompleted: false,
      profilePhotoUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
    };
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
          // Try to fetch user from database
          const userData = await fetchUserData(session.user.id);

          if (userData) {
            // User exists in database
            console.log('Setting user from DB:', userData);
            setUser(userData);
          } else {
            // User doesn't exist in DB yet, use auth user
            console.log('User not in DB yet, using auth user');
            const authUser = convertAuthUser(session.user);
            setUser(authUser);
          }
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
          // Try to fetch user from database
          const userData = await fetchUserData(session.user.id);

          if (userData) {
            console.log('Setting user from DB (auth change):', userData);
            setUser(userData);
          } else {
            console.log('User not in DB yet (auth change), using auth user');
            const authUser = convertAuthUser(session.user);
            setUser(authUser);
          }
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
  }, [fetchUserData, convertAuthUser]);

  // Mutate function to refresh user data
  const mutate = useCallback(async () => {
    const { data: { session } } = await supabase().auth.getSession();

    if (session?.user) {
      const userData = await fetchUserData(session.user.id);
      if (userData) {
        setUser(userData);
      } else {
        const authUser = convertAuthUser(session.user);
        setUser(authUser);
      }
    } else {
      setUser(null);
    }
  }, [fetchUserData, convertAuthUser]);

  return {
    user,
    loading,
    error,
    mutate,
  };
}
