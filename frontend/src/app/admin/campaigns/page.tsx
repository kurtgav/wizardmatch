'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign
} from '@/lib/api-campaign';
import { format } from 'date-fns';

interface CampaignData {
    id?: string;
    name: string;
    surveyOpenDate: string;
    surveyCloseDate: string;
    profileUpdateStartDate: string;
    profileUpdateEndDate: string;
    resultsReleaseDate: string;
    isActive: boolean;
    config: any;
    // status fields from backend
    phase?: string;
    nextPhaseLabel?: string;
    timeRemaining?: number;
}

const DEFAULT_FORM_DATA: CampaignData = {
    name: '',
    surveyOpenDate: '',
    surveyCloseDate: '',
    profileUpdateStartDate: '',
    profileUpdateEndDate: '',
    resultsReleaseDate: '',
    isActive: false,
    config: {}
};

export default function AdminCampaignsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [formData, setFormData] = useState<CampaignData>(DEFAULT_FORM_DATA);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        // Check if admin (simple check)
        const allowedEmails = ['kurtgavin.design@gmail.com', 'nicolemaaba@gmail.com', 'Agpfrancisco1@gmail.com'];
        if (user && !allowedEmails.includes(user.email)) {
            router.push('/dashboard');
            return;
        }

        loadCampaigns();
    }, [user, authLoading, router]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const res = await getCampaigns();
            if (res.success && Array.isArray(res.data)) {
                setCampaigns(res.data);
            }
        } catch (err) {
            console.error('Failed to load campaigns', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setFormData(DEFAULT_FORM_DATA);
        setIsEditing(false);
        setView('form');
    };

    const handleEditClick = (campaign: CampaignData) => {
        // format dates for datetime-local input (YYYY-MM-DDThh:mm)
        const formatDateForInput = (dateStr: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().slice(0, 16); // Extract YYYY-MM-DDThh:mm
        };

        setFormData({
            ...campaign,
            surveyOpenDate: formatDateForInput(campaign.surveyOpenDate),
            surveyCloseDate: formatDateForInput(campaign.surveyCloseDate),
            profileUpdateStartDate: formatDateForInput(campaign.profileUpdateStartDate),
            profileUpdateEndDate: formatDateForInput(campaign.profileUpdateEndDate),
            resultsReleaseDate: formatDateForInput(campaign.resultsReleaseDate),
        });
        setIsEditing(true);
        setView('form');
    };

    const handleDeleteClick = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;

        try {
            await deleteCampaign(id);
            await loadCampaigns();
        } catch (err) {
            alert('Failed to delete campaign');
            console.error(err);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert dates back to ISO strings with timezone (simple approach: append Z if treating as UTC, or just let Date handle it)
        // The backend uses time.Parse(time.RFC3339, value).
        // If we send "2026-02-14T00:00", backend might reject if it expects full ISO.
        // Let's ensure we send full ISO string.

        const toISO = (val: string) => {
            if (!val) return '';
            return new Date(val).toISOString();
        };

        const payload = {
            ...formData,
            surveyOpenDate: toISO(formData.surveyOpenDate),
            surveyCloseDate: toISO(formData.surveyCloseDate),
            profileUpdateStartDate: toISO(formData.profileUpdateStartDate),
            profileUpdateEndDate: toISO(formData.profileUpdateEndDate),
            resultsReleaseDate: toISO(formData.resultsReleaseDate),
        };

        try {
            if (isEditing && formData.id) {
                await updateCampaign(formData.id, payload);
            } else {
                await createCampaign(payload);
            }
            setView('list');
            loadCampaigns();
        } catch (err) {
            console.error(err);
            alert('Failed to save campaign');
        }
    };

    const handleInputChange = (field: keyof CampaignData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-8 text-navy font-pixel">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-pixel text-navy">Campaign Management</h1>
                {view === 'list' && (
                    <Button onClick={handleCreateClick} className="bg-cardinal-red text-white hover:bg-red-700 font-bold">
                        + Create Campaign
                    </Button>
                )}
            </div>

            {view === 'list' ? (
                <div className="grid gap-6">
                    {campaigns.length === 0 ? (
                        <div className="text-center py-12 bg-white border-2 border-navy rounded-lg">
                            <p className="text-navy/60 mb-4">No campaigns found.</p>
                            <Button onClick={handleCreateClick} variant="outline" className="border-navy text-navy">
                                Create your first campaign
                            </Button>
                        </div>
                    ) : (
                        campaigns.map((campaign) => (
                            <Card key={campaign.id} className="p-6 bg-white border-2 border-navy relative overflow-hidden group hover:shadow-lg transition-all">
                                <div className={`absolute top-0 right-0 p-2 text-xs font-bold border-l-2 border-b-2 border-navy ${campaign.isActive ? 'bg-retro-mint text-navy' : 'bg-gray-200 text-gray-500'}`}>
                                    {campaign.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </div>

                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-navy mb-1">{campaign.name}</h2>
                                    <div className="text-xs uppercase font-bold text-cardinal-red tracking-wider">
                                        ID: {campaign.id?.substring(0, 8)}...
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm mb-6 bg-retro-cream p-4 border border-navy/20 rounded">
                                    <div>
                                        <div className="text-navy/60 text-xs uppercase mb-1">Survey Open</div>
                                        <div className="font-bold">{format(new Date(campaign.surveyOpenDate), 'MMM d, yyyy HH:mm')}</div>
                                    </div>
                                    <div>
                                        <div className="text-navy/60 text-xs uppercase mb-1">Survey Close</div>
                                        <div className="font-bold">{format(new Date(campaign.surveyCloseDate), 'MMM d, yyyy HH:mm')}</div>
                                    </div>
                                    <div>
                                        <div className="text-navy/60 text-xs uppercase mb-1">Profile Updates</div>
                                        <div className="font-bold">
                                            {format(new Date(campaign.profileUpdateStartDate), 'MMM d')} - {format(new Date(campaign.profileUpdateEndDate), 'MMM d')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-navy/60 text-xs uppercase mb-1">Results</div>
                                        <div className="font-bold">{format(new Date(campaign.resultsReleaseDate), 'MMM d, yyyy HH:mm')}</div>
                                    </div>
                                    <div>
                                        <div className="text-navy/60 text-xs uppercase mb-1">Phase</div>
                                        <div className="font-bold text-cardinal-red">{campaign.phase || '-'}</div>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleEditClick(campaign)}
                                        className="border-navy text-navy hover:bg-navy/5"
                                    >
                                        Edit Configuration
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDeleteClick(campaign.id!)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                <Card className="p-8 bg-white border-2 border-navy max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 pb-4 border-b-2 border-navy/10">
                        {isEditing ? 'Edit Campaign' : 'New Campaign'}
                    </h2>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-navy uppercase">Campaign Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                                className="border-navy"
                                placeholder="e.g. Valentine's 2026"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-navy uppercase">Survey Returns (Open)</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.surveyOpenDate}
                                    onChange={(e) => handleInputChange('surveyOpenDate', e.target.value)}
                                    required
                                    className="border-navy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-navy uppercase">Survey Close</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.surveyCloseDate}
                                    onChange={(e) => handleInputChange('surveyCloseDate', e.target.value)}
                                    required
                                    className="border-navy"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-navy uppercase">Profile Updates Start</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.profileUpdateStartDate}
                                    onChange={(e) => handleInputChange('profileUpdateStartDate', e.target.value)}
                                    required
                                    className="border-navy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-navy uppercase">Profile Updates End</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.profileUpdateEndDate}
                                    onChange={(e) => handleInputChange('profileUpdateEndDate', e.target.value)}
                                    required
                                    className="border-navy"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-navy uppercase">Results Release</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.resultsReleaseDate}
                                    onChange={(e) => handleInputChange('resultsReleaseDate', e.target.value)}
                                    required
                                    className="border-navy"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="w-5 h-5 accent-cardinal-red"
                            />
                            <label htmlFor="isActive" className="text-navy font-bold">Set as Active Campaign</label>
                        </div>
                        <p className="text-xs text-navy/60 -mt-4 pl-7">Only one campaign should be active at a time.</p>

                        <div className="flex justify-end gap-4 pt-6 border-t border-navy/10 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setView('list')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-cardinal-red text-white hover:bg-red-700 min-w-[120px]">
                                {isEditing ? 'Save Changes' : 'Create Campaign'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
}
