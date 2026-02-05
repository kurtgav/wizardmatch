import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  studentId: string;
  program: string;
  yearLevel: number;
  surveyCompleted: boolean;
  profilePhotoUrl?: string;
  bio?: string;
  instagramHandle?: string;
  socialMediaName?: string;
  phoneNumber?: string;
  contactPreference?: string;
  profileVisibility?: string;
}

const fetcher = async (url: string) => {
  try {
    // Get Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Auth fetch error:', error);
    return null;
  }
};

export function useAuthState() {
  // We'll use SWR's conditional fetching by passing null as key
  // We'll always pass the URL but the fetcher will return null if no session
  const { data: user, error, mutate, isLoading } = useSWR<User | null>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      refreshInterval: 0,
    }
  );

  return {
    user,
    loading: isLoading,
    error,
    mutate
  };
}
