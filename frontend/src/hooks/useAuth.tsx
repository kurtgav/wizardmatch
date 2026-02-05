'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type UserProfile } from '@/lib/supabase';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  program: string;
  yearLevel: number;
  surveyCompleted: boolean;
  profilePhotoUrl?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase().auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase().auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      // First try to get user from our backend API
      const response = await api.getSession();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // If backend doesn't have the user, create from Supabase user
        const { data: { user: supabaseUser } } = await supabase().auth.getUser();

        if (supabaseUser) {
          // Create a basic user object from Supabase user
          const basicUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            firstName: supabaseUser.user_metadata?.first_name || '',
            lastName: supabaseUser.user_metadata?.last_name || '',
            program: '',
            yearLevel: 1,
            surveyCompleted: false,
          };
          setUser(basicUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function login() {
    // Supabase handles login through OAuth
    // The auth state change listener will handle setting the user
  }

  async function logout() {
    await supabase().auth.signOut();
    setUser(null);
    router.push('/auth/login');
  }

  function updateUser(updatedUser: User) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
