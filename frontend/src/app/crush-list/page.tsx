'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CrushListForm } from '@/components/crush/CrushListForm';
import { getActiveCampaign, getCrushList, submitCrushList, checkActionAllowed } from '@/lib/api-campaign';

export const dynamic = 'force-dynamic';

export default function CrushListPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [existingCrushes, setExistingCrushes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

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

        const isAdmin = user?.email === 'kurtgavin.design@gmail.com';

        // Relax check for admin for testing
        if (!allowedRes.data.allowed && !isAdmin) {
          setError(`Crush list submission is not currently allowed. Campaign phase: ${allowedRes.data.phase}`);
          return;
        }

        setCampaign(campaignRes.data);

        // Load existing crush list
        if (user) {
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

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

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
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="bg-white border-4 border-navy p-6 mb-8 shadow-[8px_8px_0_0_#1E3A8A] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-retro-pink border-l-4 border-b-4 border-navy" />
              <h2 className="font-pixel text-lg text-cardinal-red mb-2 uppercase tracking-tighter">Notice</h2>
              <p className="font-body text-navy">{error}</p>
              <div className="flex gap-2 mt-4 items-center">
                <div className="w-2 h-2 bg-retro-yellow border border-navy animate-pulse" />
                <p className="font-pixel text-[10px] text-navy/40">ADMIN BYPASS ACTIVE</p>
              </div>
            </div>
          )}

          <CrushListForm
            onSubmit={handleSubmit}
            existingCrushes={existingCrushes}
            maxCrushes={2}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
