'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getActiveCampaign, createCampaign, updateCampaign, getCampaignStats, updateCampaignStats } from '@/lib/api-campaign';
import { format } from 'date-fns';

export default function AdminCampaignsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        // Check if admin (simple check)
        if (user && user.email !== 'kurtgavin.design@gmail.com' && user.email !== 'nicolemaaba@gmail.com' && user.email !== 'Agpfrancisco1@gmail.com') {
            router.push('/dashboard');
            return;
        }

        loadCampaign();
    }, [user, authLoading, router]);

    const loadCampaign = async () => {
        setLoading(true);
        try {
            const res = await getActiveCampaign();
            if (res.success && res.data) {
                setCampaign(res.data);
                loadStats(res.data.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async (id: string) => {
        try {
            const res = await getCampaignStats(id);
            if (res.success && res.data) {
                setStats(res.data.campaign);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateDefaults = async () => {
        if (!confirm('Create default Valentine 2026 campaign?')) return;

        try {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            // Default dates as per plan
            const defaultCampaign = {
                name: "Wizard Match Valentine's 2026",
                surveyOpenDate: "2026-02-05T00:00:00Z",
                surveyCloseDate: "2026-02-10T23:59:59Z",
                profileUpdateStartDate: "2026-02-11T00:00:00Z",
                profileUpdateEndDate: "2026-02-13T23:59:59Z",
                resultsReleaseDate: "2026-02-14T00:00:00Z",
                isActive: true,
                config: {}
            };

            await createCampaign(defaultCampaign);
            loadCampaign();
        } catch (err) {
            alert('Failed to create');
        }
    };

    const handlePhaseChange = async (phase: string) => {
        if (!campaign) return;
        // Helper to simulate phase changes by updating dates (for testing)
        // This is getting complex, maybe just simple date Editor?
        // For now, let's just show info.
        alert('Date editing to come in next iteration.');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 font-pixel text-navy">Campaign Management</h1>

            {!campaign ? (
                <Card className="p-6 bg-white border-2 border-navy">
                    <p className="mb-4">No active campaign found.</p>
                    <Button onClick={handleCreateDefaults} className="bg-cardinal-red text-white">
                        Create Valentine's 2026 Campaign
                    </Button>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Active Campaign Info */}
                    <Card className="p-6 bg-white border-2 border-navy relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-retro-mint text-navy text-xs font-bold border-l-2 border-b-2 border-navy">
                            ACTIVE
                        </div>

                        <h2 className="text-xl font-bold mb-4">{campaign.name}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="font-bold border-b-2 border-navy/10 pb-1">Timeline</h3>
                                <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
                                    <div className="text-navy/60">Survey Open:</div>
                                    <div>{format(new Date(campaign.surveyOpenDate), 'PPP p')}</div>

                                    <div className="text-navy/60">Survey Close:</div>
                                    <div>{format(new Date(campaign.surveyCloseDate), 'PPP p')}</div>

                                    <div className="text-navy/60">Profile Update:</div>
                                    <div>{format(new Date(campaign.profileUpdateStartDate), 'PPP')} - {format(new Date(campaign.profileUpdateEndDate), 'PPP')}</div>

                                    <div className="text-navy/60">Results Day:</div>
                                    <div>{format(new Date(campaign.resultsReleaseDate), 'PPP p')}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold border-b-2 border-navy/10 pb-1">Current Status</h3>
                                <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
                                    <div className="text-navy/60">Phase:</div>
                                    <div className="uppercase font-bold text-cardinal-red">{campaign.phase}</div>

                                    <div className="text-navy/60">Next Event:</div>
                                    <div>{campaign.nextPhaseLabel} ({campaign.timeRemaining})</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Stats */}
                    {stats && (
                        <Card className="p-6 bg-white border-2 border-navy">
                            <h3 className="font-bold border-b-2 border-navy/10 pb-1 mb-4">Live Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-retro-cream p-4 border border-navy text-center">
                                    <div className="text-3xl font-pixel text-navy">{stats.totalParticipants || 0}</div>
                                    <div className="text-xs uppercase text-navy/60 mt-1">Participants</div>
                                </div>
                                <div className="bg-retro-lavender p-4 border border-navy text-center">
                                    <div className="text-3xl font-pixel text-navy">{stats.surveyCompletedCount || 0}</div>
                                    <div className="text-xs uppercase text-navy/60 mt-1">Surveys Done</div>
                                </div>
                                <div className="bg-retro-mint p-4 border border-navy text-center">
                                    <div className="text-3xl font-pixel text-navy">{stats.totalMatches || 0}</div>
                                    <div className="text-xs uppercase text-navy/60 mt-1">Matches</div>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="flex gap-4">
                        <Button variant="outline" className="border-navy text-navy" disabled>Edit Configuration</Button>
                        <Button variant="primary" className="bg-red-600 border-red-800 text-white hover:bg-red-700" disabled>End Campaign</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
