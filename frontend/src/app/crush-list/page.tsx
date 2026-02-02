'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CrushListForm } from '@/components/crush/CrushListForm';
import { getActiveCampaign, getCrushList, submitCrushList, checkActionAllowed } from '@/lib/api-campaign';

export const dynamic = 'force-dynamic';

export default function CrushListPage() {
  const sessionResult = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [existingCrushes, setExistingCrushes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle build-time undefined session
  if (!sessionResult) {
    return null;
  }

  const { data: session, status } = sessionResult;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignRes, allowedRes] = await Promise.all([
          getActiveCampaign(),
          checkActionAllowed('submit_crush_list'),
        ]);

        if (!campaignRes.success || !campaignRes.data) {
          setError('No active campaign found');
          return;
        }

        if (!allowedRes.data.allowed) {
          setError(`Crush list submission is not currently allowed. Campaign phase: ${allowedRes.data.phase}`);
          return;
        }

        setCampaign(campaignRes.data);

        // Load existing crush list
        if (session?.user) {
          try {
            const crushesRes = await getCrushList();
            if (crushesRes.success) {
              setExistingCrushes(crushesRes.data);
            }
          } catch (err) {
            // No existing crushes
          }
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

  const handleSubmit = async (crushes: Array<{ email: string; name?: string }>) => {
    setSubmitting(true);
    setError('');
    try {
      const result = await submitCrushList(crushes);
      if (result.success) {
        router.push('/survey/complete?message=' + encodeURIComponent(result.message));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit crush list');
    } finally {
      setSubmitting(false);
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
          <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Submit Crush List</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <CrushListForm
          onSubmit={handleSubmit}
          existingCrushes={existingCrushes}
          maxCrushes={10}
        />
      </div>
    </div>
  );
}
