'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
    Users,
    Search,
    Heart,
    ArrowLeft,
    Shield,
    Trash2,
    CheckCircle2,
    XCircle,
    Zap,
    Filter
} from 'lucide-react';

interface EligibleUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    program: string;
    gender?: string;
    seekingGender?: string;
    profilePhotoUrl?: string;
}

interface Match {
    id: string;
    user1: { firstName: string; lastName: string; program: string };
    user2: { firstName: string; lastName: string; program: string };
    compatibilityScore: string;
    matchTier?: string;
}

export default function MatchesDashboardPage() {
    const { user: currentUser, loading: authLoading } = useAuthState();
    const router = useRouter();
    const [users, setUsers] = useState<EligibleUser[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser1, setSelectedUser1] = useState<EligibleUser | null>(null);
    const [selectedUser2, setSelectedUser2] = useState<EligibleUser | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const ADMIN_EMAILS = ['kurtgavin.design@gmail.com', 'admin@wizardmatch.ai'];

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser) {
                router.push('/auth/login');
            } else if (!ADMIN_EMAILS.includes(currentUser.email)) {
                router.push('/');
            } else {
                fetchData();
            }
        }
    }, [currentUser, authLoading]);

    async function fetchData() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [usersRes, matchesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/eligible-users`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/matches?limit=100`, { headers })
            ]);

            if (usersRes.ok && matchesRes.ok) {
                const usersData = await usersRes.json();
                const matchesData = await matchesRes.json();
                setUsers(usersData.data || []);
                setMatches(matchesData.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateMatches() {
        if (!confirm('WARNING: This will calculate matches for ALL users based on the algorithm. Existing matches might be duplicated or overwritten depending on logic. Continue?')) {
            return;
        }

        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/generate-matches`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setFeedback({ type: 'success', message: `Algorithm Run: ${data.data?.matchCount || 0} matches generated.` });
                fetchData();
            } else {
                setFeedback({ type: 'error', message: data.message || 'Failed to generate matches.' });
            }
        } catch (error) {
            setFeedback({ type: 'error', message: 'Connection error during generation.' });
        } finally {
            setGenerating(false);
        }
    }

    async function handleCreateMatch() {
        if (!selectedUser1 || !selectedUser2) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/manual-match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user1Id: selectedUser1.id,
                    user2Id: selectedUser2.id,
                    compatibilityScore: 100
                }),
            });

            const data = await response.json();
            if (data.success) {
                setFeedback({ type: 'success', message: 'Manual match created successfully!' });
                setSelectedUser1(null);
                setSelectedUser2(null);
                fetchData();
            } else {
                setFeedback({ type: 'error', message: data.message || 'Failed to create match.' });
            }
        } catch (error) {
            setFeedback({ type: 'error', message: 'Connection error.' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setFeedback(null), 3000);
        }
    }

    async function handleDeleteMatch(matchId: string) {
        if (!confirm('Are you sure you want to delete this match?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/matches/${matchId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Failed to delete match:', error);
        }
    }

    const filteredUsers = users.filter(u =>
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // Split users by gender
    const maleUsers = filteredUsers.filter(u => u.gender?.toLowerCase() === 'male');
    const femaleUsers = filteredUsers.filter(u => u.gender?.toLowerCase() === 'female');
    const otherUsers = filteredUsers.filter(u => {
        const g = u.gender?.toLowerCase();
        return g !== 'male' && g !== 'female';
    });

    const handleUserSelect = (u: EligibleUser) => {
        if (selectedUser1?.id === u.id) {
            setSelectedUser1(null);
        } else if (selectedUser2?.id === u.id) {
            setSelectedUser2(null);
        } else if (!selectedUser1) {
            setSelectedUser1(u);
        } else if (!selectedUser2) {
            setSelectedUser2(u);
        } else {
            // Replace user 2 if both full
            setSelectedUser2(u);
        }
    };

    const isSelected = (id: string) => selectedUser1?.id === id || selectedUser2?.id === id;

    return (
        <div className="min-h-screen bg-retro-cream">
            <Header />

            <main className="container mx-auto px-4 pt-32 pb-20 max-w-7xl">
                {/* Back Button */}
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-navy hover:text-cardinal-red transition-colors mb-8 font-pixel text-xs group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    BACK TO DASHBOARD
                </Link>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-cardinal-red border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="font-display font-black text-4xl text-navy">MATCH DASHBOARD</h1>
                        </div>
                        <p className="font-pixel text-[10px] text-navy/60 uppercase">CUPID'S CONTROL CENTER</p>
                    </div>

                    <button
                        onClick={handleGenerateMatches}
                        disabled={generating}
                        className={`px-8 py-4 border-4 border-navy font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] flex items-center gap-3 transition-all ${generating ? 'bg-navy text-white cursor-wait' : 'bg-retro-yellow text-navy hover:bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                            }`}
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                RUNNING ALGORITHM...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                AUTO-GENERATE MATCHES
                            </>
                        )}
                    </button>
                </div>

                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 mb-8 border-4 border-navy shadow-[6px_6px_0_0_#1E3A8A] flex items-center gap-3 ${feedback.type === 'success' ? 'bg-retro-mint' : 'bg-retro-pink'
                            }`}
                    >
                        {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <p className="font-pixel text-[10px]">{feedback.message}</p>
                    </motion.div>
                )}

                {/* Match Creator Zone - Sticky or Top */}
                <div className="bg-navy text-white p-6 border-4 border-navy shadow-[8px_8px_0_0_#E52037] mb-12 sticky top-24 z-30">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Slot 1 */}
                        <div className={`flex-1 w-full relative border-4 p-4 transition-all ${selectedUser1 ? 'bg-retro-sky text-navy border-retro-sky' : 'bg-white/10 border-white/20 border-dashed'}`}>
                            <small className="absolute -top-3 left-4 bg-navy px-2 font-pixel text-[8px] text-white/50">SLOT 1 (MALE)</small>
                            {selectedUser1 ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white border-2 border-navy overflow-hidden">
                                            {selectedUser1.profilePhotoUrl ? (
                                                <img src={selectedUser1.profilePhotoUrl} className="w-full h-full object-cover" />
                                            ) : <Users className="w-full h-full p-2 text-navy/20" />}
                                        </div>
                                        <div>
                                            <p className="font-display font-bold leading-none">{selectedUser1.firstName} {selectedUser1.lastName}</p>
                                            <p className="text-[10px] opacity-60 mt-1">{selectedUser1.program} • {selectedUser1.gender}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser1(null)} className="hover:text-cardinal-red"><XCircle className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <p className="font-pixel text-[8px] text-white/30 py-3 text-center">SELECT FROM LIST</p>
                            )}
                        </div>

                        {/* Heart Divider */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-retro-pink border-4 border-white flex items-center justify-center rotate-45 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                                <Heart className="w-6 h-6 text-white -rotate-45" />
                            </div>
                        </div>

                        {/* Slot 2 */}
                        <div className={`flex-1 w-full relative border-4 p-4 transition-all ${selectedUser2 ? 'bg-retro-pink text-navy border-retro-pink' : 'bg-white/10 border-white/20 border-dashed'}`}>
                            <small className="absolute -top-3 left-4 bg-navy px-2 font-pixel text-[8px] text-white/50">SLOT 2 (FEMALE)</small>
                            {selectedUser2 ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white border-2 border-navy overflow-hidden">
                                            {selectedUser2.profilePhotoUrl ? (
                                                <img src={selectedUser2.profilePhotoUrl} className="w-full h-full object-cover" />
                                            ) : <Users className="w-full h-full p-2 text-navy/20" />}
                                        </div>
                                        <div>
                                            <p className="font-display font-bold leading-none">{selectedUser2.firstName} {selectedUser2.lastName}</p>
                                            <p className="text-[10px] opacity-60 mt-1">{selectedUser2.program} • {selectedUser2.gender}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser2(null)} className="hover:text-cardinal-red"><XCircle className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <p className="font-pixel text-[8px] text-white/30 py-3 text-center">SELECT FROM LIST</p>
                            )}
                        </div>

                        {/* Action */}
                        <button
                            disabled={!selectedUser1 || !selectedUser2 || submitting}
                            onClick={handleCreateMatch}
                            className={`px-8 py-4 border-4 border-white font-pixel text-xs transition-all shadow-[4px_4px_0_0_#E52037] flex items-center gap-2 ${!selectedUser1 || !selectedUser2 || submitting
                                ? 'bg-white/20 text-white/40 cursor-not-allowed border-white/20 shadow-none'
                                : 'bg-retro-yellow text-navy hover:bg-white hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                                }`}
                        >
                            {submitting ? 'Creating...' : 'MATCH NOW'}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white border-4 border-navy p-4 shadow-[4px_4px_0_0_#1E3A8A] flex items-center gap-4">
                    <Search className="w-5 h-5 text-navy/40" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 font-body text-sm outline-none placeholder:text-navy/20"
                    />
                    <div className="h-6 w-px bg-navy/10" />
                    <span className="font-pixel text-[10px] text-navy/40 uppercase">{filteredUsers.length} USERS FOUND</span>
                </div>

                {/* Lists Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Males List */}
                    <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 bg-retro-sky border-b-4 border-navy flex justify-between items-center">
                            <h2 className="font-pixel text-xs text-navy uppercase flex items-center gap-2">
                                <Users className="w-4 h-4" /> AVAILABLE MALES
                            </h2>
                            <span className="bg-white border-2 border-navy px-2 py-0.5 font-pixel text-[8px]">{maleUsers.length}</span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                            {maleUsers.length === 0 ? (
                                <p className="text-center py-10 font-pixel text-[10px] text-navy/30">NO USERS FOUND</p>
                            ) : (
                                maleUsers.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleUserSelect(u)}
                                        className={`p-3 border-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected(u.id)
                                            ? 'bg-retro-sky/20 border-retro-sky'
                                            : 'border-navy/10 hover:border-navy hover:bg-retro-cream'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex-shrink-0 bg-retro-cream border-2 border-navy overflow-hidden">
                                                {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} className="w-full h-full object-cover" /> : <Users className="w-full h-full p-1.5 text-navy/20" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-display font-bold text-navy text-sm truncate">{u.firstName} {u.lastName}</p>
                                                <p className="font-pixel text-[8px] text-navy/50 truncate">SEEKING: {u.seekingGender || 'ANY'}</p>
                                            </div>
                                        </div>
                                        {isSelected(u.id) && <CheckCircle2 className="w-4 h-4 text-retro-sky" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Females List */}
                    <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 bg-retro-pink border-b-4 border-navy flex justify-between items-center">
                            <h2 className="font-pixel text-xs text-navy uppercase flex items-center gap-2">
                                <Users className="w-4 h-4" /> AVAILABLE FEMALES
                            </h2>
                            <span className="bg-white border-2 border-navy px-2 py-0.5 font-pixel text-[8px]">{femaleUsers.length}</span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                            {femaleUsers.length === 0 ? (
                                <p className="text-center py-10 font-pixel text-[10px] text-navy/30">NO USERS FOUND</p>
                            ) : (
                                femaleUsers.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleUserSelect(u)}
                                        className={`p-3 border-2 transition-all cursor-pointer flex items-center justify-between group ${isSelected(u.id)
                                            ? 'bg-retro-pink/20 border-retro-pink'
                                            : 'border-navy/10 hover:border-navy hover:bg-retro-cream'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex-shrink-0 bg-retro-cream border-2 border-navy overflow-hidden">
                                                {u.profilePhotoUrl ? <img src={u.profilePhotoUrl} className="w-full h-full object-cover" /> : <Users className="w-full h-full p-1.5 text-navy/20" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-display font-bold text-navy text-sm truncate">{u.firstName} {u.lastName}</p>
                                                <p className="font-pixel text-[8px] text-navy/50 truncate">SEEKING: {u.seekingGender || 'ANY'}</p>
                                            </div>
                                        </div>
                                        {isSelected(u.id) && <CheckCircle2 className="w-4 h-4 text-retro-pink" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Other Users / All Users Toggle could go here if needed, but omitted for clarity */}

                {/* Match History */}
                <div className="bg-white border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A]">
                    <h2 className="font-pixel text-xs text-navy mb-6 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-cardinal-red" /> EXISTING MATCHES ({matches.length})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-navy text-white font-pixel text-[8px] uppercase tracking-widest text-left">
                                    <th className="p-3 border-r border-white/10">USER 1</th>
                                    <th className="p-3 border-r border-white/10">USER 2</th>
                                    <th className="p-3 border-r border-white/10">SCORE</th>
                                    <th className="p-3 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-navy/10 font-display text-sm">
                                {matches.map((m) => (
                                    <tr key={m.id} className="hover:bg-retro-cream transition-colors">
                                        <td className="p-3 border-r border-navy/10">
                                            <p className="font-bold text-navy">{m.user1.firstName} {m.user1.lastName}</p>
                                            <p className="text-[10px] text-navy/50">{m.user1.program}</p>
                                        </td>
                                        <td className="p-3 border-r border-navy/10">
                                            <p className="font-bold text-navy">{m.user2.firstName} {m.user2.lastName}</p>
                                            <p className="text-[10px] text-navy/50">{m.user2.program}</p>
                                        </td>
                                        <td className="p-3 border-r border-navy/10 text-center font-pixel text-[10px] text-cardinal-red">
                                            {Math.round(parseFloat(m.compatibilityScore))}%
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleDeleteMatch(m.id)}
                                                className="p-2 bg-retro-pink border-2 border-navy text-navy shadow-[2px_2px_0_0_#1E3A8A] hover:bg-cardinal-red hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {matches.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center font-pixel text-[10px] text-navy/30">
                                            NO MATCHES GENERATED YET
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
