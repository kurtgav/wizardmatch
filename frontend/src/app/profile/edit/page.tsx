'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/useAuthState';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { updateProfile } from '@/lib/api-campaign';
import { Heart } from 'lucide-react'; // Though not directly used here, maybe good practice. Wait, I don't need to import Heart here.

// I will just update the setProfile call.

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

export default function ProfileEditPage() {
  const { user, loading: authLoading, mutate } = useAuthState();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    const loadData = async () => {
      try {
        // Load user profile from API
        if (user) {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            // Handle wrapped response
            const profileData = result.success ? result.data : result;
            setProfile({
              username: profileData.username || '',
              bio: profileData.bio || '',
              profilePhotoUrl: profileData.profilePhotoUrl || '',
              instagramHandle: profileData.instagramHandle || '',
              facebookProfile: profileData.facebookProfile || '',
              program: profileData.program || '',
              yearLevel: profileData.yearLevel || 1,
              phoneNumber: profileData.phoneNumber || '',
              contactPreference: (profileData.contactPreference as any) === 'Email' ? 'Instagram' : profileData.contactPreference || 'Instagram',
              profileVisibility: profileData.profileVisibility || 'Matches Only',
              gender: profileData.gender || '',
              seekingGender: profileData.seekingGender || '',
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
            });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const handleSave = async (data: any) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = await updateProfile(data);

      // Refresh the user session to get updated data
      if (mutate) {
        await mutate();
      }

      setSuccess('Profile saved successfully!');
      setSaving(false);

      // Scroll to top to see message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cardinal-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-retro-cream">
      <Header />

      <main className="flex-1 container mx-auto pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="bg-white border-4 border-navy p-6 mb-8 shadow-[8px_8px_0_0_#1E3A8A] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-retro-pink border-l-4 border-b-4 border-navy" />
              <h2 className="font-pixel text-lg text-cardinal-red mb-2 uppercase tracking-tighter">Notice</h2>
              <p className="font-body text-navy">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-white border-4 border-navy p-6 mb-8 shadow-[8px_8px_0_0_#1E3A8A] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-retro-mint border-l-4 border-b-4 border-navy" />
              <h2 className="font-pixel text-lg text-retro-mint mb-2 uppercase tracking-tighter">Success</h2>
              <p className="font-body text-navy">{success}</p>
            </div>
          )}

          <ProfileEditor
            profile={profile || {}}
            onSave={handleSave}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
