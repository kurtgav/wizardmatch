'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
    Heart,
    Search,
    User,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    ArrowRight
} from 'lucide-react';

interface CrushEntry {
    id: string;
    userId: string;
    campaignId: string;
    crushEmail: string;
    crushName?: string;
    isMatched: boolean;
    isMutual: boolean;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        studentId?: string;
    };
    campaign: {
        name: string;
    };
}

export default function AdminCrushListsPage() {
    const { user, loading: authLoading } = useAuthState();
    const router = useRouter();
    const [crushLists, setCrushLists] = useState<CrushEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const ADMIN_EMAILS = ['kurtgavin.design@gmail.com', 'nicolemaaba@gmail.com', 'Agpfrancisco1@gmail.com'];

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && !ADMIN_EMAILS.includes(user.email)) {
            router.push('/');
            return;
        }

        if (user && ADMIN_EMAILS.includes(user.email)) {
            loadCrushLists();
        }
    }, [user, authLoading, router]);

    async function loadCrushLists() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/crush-lists?limit=1000`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCrushLists(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to load crush lists:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredList = crushLists.filter(entry =>
        entry.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.crushEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.crushName && entry.crushName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-retro-cream">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-navy border-t-cardinal-red rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-retro-cream">
            <Header />
            <div className="container mx-auto px-4 max-w-7xl pt-32 pb-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="font-display font-black text-4xl md:text-5xl text-navy mb-2">
                        CRUSH LIST DASHBOARD
                    </h1>
                    <p className="font-pixel text-sm text-navy/70">
                        Total Entries: {crushLists.length} | Showing: {filteredList.length}
                    </p>
                </motion.div>

                {/* Search */}
                <div className="mb-8 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                        <input
                            type="text"
                            placeholder="Search user or crush..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-4 border-navy font-body text-navy bg-white focus:outline-none focus:bg-retro-cream"
                        />
                    </div>
                </div>

                {/* List View */}
                <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A]">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 border-b-4 border-navy bg-retro-cream p-4 font-pixel text-xs text-navy uppercase">
                        <div className="col-span-4">Submitted By</div>
                        <div className="col-span-1 flex justify-center items-center">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="col-span-4">Crush Target</div>
                        <div className="col-span-3 text-right">Status</div>
                    </div>

                    <div className="divide-y-2 divide-navy">
                        {filteredList.length === 0 ? (
                            <div className="p-8 text-center text-navy/50 font-pixel">
                                NO CRUSH ENTRIES FOUND
                            </div>
                        ) : (
                            filteredList.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.005 }}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-retro-yellow/10 transition-colors"
                                >
                                    {/* Submitted By */}
                                    <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-retro-sky border-2 border-navy flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-navy/50" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-display font-bold text-navy truncate">
                                                {entry.user.firstName} {entry.user.lastName}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-navy/40" />
                                                <span className="font-body text-xs text-navy/60 truncate">{entry.user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="col-span-1 flex md:justify-center pl-4 md:pl-0">
                                        <ArrowRight className="w-5 h-5 text-cardinal-red rotate-90 md:rotate-0" />
                                    </div>

                                    {/* Crush Target */}
                                    <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-retro-pink border-2 border-navy flex items-center justify-center flex-shrink-0">
                                            <Heart className="w-5 h-5 text-cardinal-red" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-display font-bold text-navy truncate">
                                                {entry.crushName || 'Unknown Name'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-navy/40" />
                                                <span className="font-body text-xs text-navy/60 truncate">{entry.crushEmail}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1 md:col-span-3 flex md:justify-end gap-2">
                                        {entry.isMatched ? (
                                            <span className="px-2 py-1 bg-green-100 border-2 border-green-600 text-green-800 font-pixel text-[10px] flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> MATCHED
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 border-2 border-gray-400 text-gray-500 font-pixel text-[10px] flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-gray-400" /> PENDING
                                            </span>
                                        )}

                                        {entry.isMutual && (
                                            <span className="px-2 py-1 bg-retro-pink border-2 border-cardinal-red text-cardinal-red font-pixel text-[10px] flex items-center gap-1">
                                                <Heart className="w-3 h-3 fill-current" /> MUTUAL
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
