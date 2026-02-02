'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { getActiveCampaign, updateProfile } from '@/lib/api-campaign';

export const dynamic = 'force-dynamic';

export default function ProfileEditPage() {
  const sessionResult = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Handle build-time undefined session
  if (!sessionResult) {
    return null;
  }

  const { data: session, status } = sessionResult;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignRes] = await Promise.all([
          getActiveCampaign(),
        ]);

        if (!campaignRes.success || !campaignRes.data) {
          setError('No active campaign found');
          return;
        }

        const phase = campaignRes.data.phase;
        // Only allow profile editing during survey_open or profile_update
        if (phase !== 'survey_open' && phase !== 'profile_update') {
          setError('Profile editing is not currently available.');
          return;
        }

        setCampaign(campaignRes.data);

        // Load user profile from API or session
        if (session?.user) {
          // For now, initialize with empty values - will load from API
          setProfile({
            bio: '',
            profilePhotoUrl: session.user.image || '',
            instagramHandle: '',
            phoneNumber: '',
            contactPreference: 'Instagram',
            profileVisibility: 'Matches Only',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const handleSave = async (data: any) => {
    setSaving(true);
    setError('');
    try {
      await updateProfile(data);

      // Show success message
      const message = campaign?.phase === 'profile_update'
        ? 'Profile updated! Your matches will see your updated profile.'
        : 'Profile saved!';

      router.push('/survey/complete?message=' + encodeURIComponent(message));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Edit Profile</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const isReadOnly = campaign?.phase !== 'survey_open' && campaign?.phase !== 'profile_update';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProfileEditor
          profile={profile || {}}
          onSave={handleSave}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
