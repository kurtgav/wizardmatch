import useSWR from 'swr';

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
  const token = localStorage.getItem('token');
  if (!token) return null;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      return null;
    }
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  return data.success ? data.data : null;
};

export function useAuthState() {
  const { data: user, error, mutate, isLoading } = useSWR<User | null>(
    typeof window !== 'undefined' && localStorage.getItem('token')
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`
      : null,
    fetcher,
    {
      revalidateOnFocus: false, // Reduce unnecessary fetches
      shouldRetryOnError: false,
    }
  );

  return {
    user,
    loading: isLoading,
    error,
    mutate
  };
}
