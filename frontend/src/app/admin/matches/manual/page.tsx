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
    ChevronRight,
    UserPlus,
    Trash2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

interface EligibleUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    program: string;
    gender: string;
    seekingGender: string;
}

interface Match {
    id: string;
    user1: { firstName: string; lastName: string; program: string };
    user2: { firstName: string; lastName: string; program: string };
    compatibilityScore: string;
}

export default function ManualMatchingPage() {
    const { user: currentUser, loading: authLoading } = useAuthState();
    const router = useRouter();
    const [users, setUsers] = useState<EligibleUser[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser1, setSelectedUser1] = useState<EligibleUser | null>(null);
    const [selectedUser2, setSelectedUser2] = useState<EligibleUser | null>(null);
    const [submitting, setSubmitting] = useState(false);
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
                setUsers(usersData.data);
                setMatches(matchesData.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
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
                setFeedback({ type: 'success', message: 'Match created successfully!' });
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
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-retro-mint border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]">
                            <Users className="w-6 h-6 text-navy" />
                        </div>
                        <h1 className="font-display font-black text-4xl text-navy">MANUAL MATCHING</h1>
                    </div>
                    <p className="font-pixel text-[10px] text-navy/60 uppercase">System Override Panel</p>
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

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: User Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A]">
                            <h2 className="font-pixel text-xs text-navy mb-6 flex items-center gap-2">
                                <Search className="w-4 h-4" /> FIND USERS
                            </h2>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="SEARCH NAME OR EMAIL..."
                                    className="w-full bg-white border-4 border-navy p-4 font-pixel text-xs focus:ring-0 focus:outline-none focus:bg-retro-cream"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="h-96 overflow-y-auto custom-scrollbar border-4 border-navy/10">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-4 border-navy border-t-cardinal-red rounded-full animate-spin" />
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-navy/40 py-10">
                                        <Users className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="font-pixel text-[10px]">NO ELIGIBLE USERS FOUND</p>
                                    </div>
                                ) : (
                                    <div className="divide-y-2 divide-navy/5">
                                        {filteredUsers.map(u => (
                                            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-retro-cream transition-colors group">
                                                <div className="min-w-0">
                                                    <p className="font-display font-bold text-navy truncate">{u.firstName} {u.lastName}</p>
                                                    <p className="font-pixel text-[8px] text-navy/50">{u.email} • {u.program || 'N/A'}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser1(u)}
                                                        disabled={selectedUser1?.id === u.id || selectedUser2?.id === u.id}
                                                        className={`px-3 py-2 border-2 border-navy font-pixel text-[8px] shadow-[3px_3px_0_0_#1E3A8A] transition-all ${selectedUser1?.id === u.id
                                                            ? 'bg-retro-sky text-navy'
                                                            : 'bg-white text-navy hover:bg-retro-sky/20 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                                                            }`}
                                                    >
                                                        SELECT 1
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedUser2(u)}
                                                        disabled={selectedUser1?.id === u.id || selectedUser2?.id === u.id}
                                                        className={`px-3 py-2 border-2 border-navy font-pixel text-[8px] shadow-[3px_3px_0_0_#1E3A8A] transition-all ${selectedUser2?.id === u.id
                                                            ? 'bg-retro-pink text-navy'
                                                            : 'bg-white text-navy hover:bg-retro-pink/20 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                                                            }`}
                                                    >
                                                        SELECT 2
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Manual Matches */}
                        <div className="bg-white border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A]">
                            <h2 className="font-pixel text-xs text-navy mb-6 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-cardinal-red" /> RECENT MATCHES
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
                    </div>

                    {/* Right Column: Match Preview & Submit */}
                    <div className="space-y-6">
                        <div className="sticky top-32">
                            <div className="bg-navy text-white p-6 border-4 border-navy shadow-[8px_8px_0_0_#E52037]">
                                <h3 className="font-pixel text-[10px] mb-8 text-retro-yellow flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> CREATION ZONE
                                </h3>

                                <div className="space-y-12">
                                    {/* Slot 1 */}
                                    <div className={`relative border-4 p-4 ${selectedUser1 ? 'bg-retro-sky/10 border-retro-sky ' : 'bg-black/20 border-white/10 border-dashed'}`}>
                                        <small className="absolute -top-3 left-4 bg-navy px-2 font-pixel text-[8px] text-white/50">SLOT 1</small>
                                        {selectedUser1 ? (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-display font-bold leading-none">{selectedUser1.firstName}</p>
                                                    <p className="text-[10px] opacity-60 mt-1">{selectedUser1.email}</p>
                                                </div>
                                                <button onClick={() => setSelectedUser1(null)} className="text-white hover:text-retro-pink"><XCircle className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <p className="font-pixel text-[8px] text-white/20 py-4 text-center">AWAITING SELECTION...</p>
                                        )}
                                    </div>

                                    <div className="flex justify-center -my-6 relative z-10">
                                        <div className="bg-retro-pink p-2 border-2 border-white rotate-45">
                                            <Heart className="w-6 h-6 text-white -rotate-45" />
                                        </div>
                                    </div>

                                    {/* Slot 2 */}
                                    <div className={`relative border-4 p-4 ${selectedUser2 ? 'bg-retro-pink/10 border-retro-pink ' : 'bg-black/20 border-white/10 border-dashed'}`}>
                                        <small className="absolute -top-3 left-4 bg-navy px-2 font-pixel text-[8px] text-white/50">SLOT 2</small>
                                        {selectedUser2 ? (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-display font-bold leading-none">{selectedUser2.firstName}</p>
                                                    <p className="text-[10px] opacity-60 mt-1">{selectedUser2.email}</p>
                                                </div>
                                                <button onClick={() => setSelectedUser2(null)} className="text-white hover:text-retro-pink"><XCircle className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <p className="font-pixel text-[8px] text-white/20 py-4 text-center">AWAITING SELECTION...</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <button
                                        disabled={!selectedUser1 || !selectedUser2 || submitting}
                                        onClick={handleCreateMatch}
                                        className={`w-full py-5 border-4 border-white font-pixel text-xs transition-all shadow-[6px_6px_0_0_#E52037] flex items-center justify-center gap-2 ${!selectedUser1 || !selectedUser2 || submitting
                                            ? 'bg-white/10 text-white/20 cursor-not-allowed border-white/20'
                                            : 'bg-retro-yellow text-navy hover:bg-white hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                                            }`}
                                    >
                                        {submitting ? 'PROCESSING...' : (
                                            <>
                                                CONFIRM MATCH <CheckCircle2 className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Tips for Admin */}
                            <div className="mt-6 bg-retro-cream border-4 border-navy border-dashed p-6">
                                <h4 className="font-pixel text-[8px] text-navy/60 mb-3">ADMIN TIPS</h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 items-start">
                                        <div className="w-2 h-2 bg-retro-pink mt-1 shrink-0" />
                                        <p className="font-body text-xs text-navy/70 leading-relaxed">
                                            Manual matching prioritizes your choice over the system algorithm.
                                        </p>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <div className="w-2 h-2 bg-retro-sky mt-1 shrink-0" />
                                        <p className="font-body text-xs text-navy/70 leading-relaxed">
                                            Matching two users who are already matched will update their score to 100%.
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
