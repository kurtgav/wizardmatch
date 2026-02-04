'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Shield,
    MessageCircle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Clock,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
    id: string;
    name: string;
    email?: string | null;
    heading: string;
    content: string;
    isApproved: boolean;
    isPublished: boolean;
    createdAt: string;
}

export default function AdminTestimonialsPage() {
    const { user, loading: authLoading } = useAuthState();
    const router = useRouter();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error: toastError } = useToast();

    const ADMIN_EMAILS = ['kurtgavin.design@gmail.com', 'admin@wizardmatch.ai'];

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user && !ADMIN_EMAILS.includes(user.email)) {
            router.push('/');
            return;
        }

        if (user) {
            loadTestimonials();
        }
    }, [user, authLoading, router]);

    async function loadTestimonials() {
        try {
            const response = await api.getAdminTestimonials();
            if (response.success) {
                setTestimonials(response.data);
            }
        } catch (err) {
            console.error('Failed to load testimonials', err);
            toastError('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(id: string, isApproved: boolean, isPublished: boolean) {
        try {
            await api.updateTestimonialStatus(id, isApproved, isPublished);
            setTestimonials(prev => prev.map(t =>
                t.id === id ? { ...t, isApproved, isPublished } : t
            ));
            success('Testimonial updated successfully');
        } catch (err) {
            console.error('Failed to update testimonial', err);
            toastError('Failed to update status');
        }
    }

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
                    className="mb-12 border-b-4 border-navy pb-8 flex justify-between items-center"
                >
                    <div className="flex items-center gap-4">
                        <MessageCircle className="w-10 h-10 text-cardinal-red" />
                        <div>
                            <h1 className="font-display font-black text-3xl md:text-4xl text-navy">
                                MANAGE STORIES
                            </h1>
                            <p className="font-pixel text-xs text-navy/70">
                                REVIEW AND PUBLISH USER TESTIMONIALS
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/admin/dashboard')}
                        variant="outline"
                        className="font-pixel text-xs border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]"
                    >
                        ← BACK TO DASHBOARD
                    </Button>
                </motion.div>

                <div className="grid gap-6">
                    {testimonials.length === 0 ? (
                        <div className="bg-white border-4 border-navy p-12 text-center shadow-[8px_8px_0_0_#1E3A8A]">
                            <p className="font-pixel text-lg text-navy/50">NO STORIES SUBMITTED YET</p>
                        </div>
                    ) : (
                        testimonials.map((t) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A] flex flex-col md:flex-row gap-6 justify-between"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`font-pixel text-[10px] px-2 py-1 text-white ${t.isPublished ? 'bg-retro-mint' : t.isApproved ? 'bg-retro-yellow' : 'bg-gray-400'}`}>
                                            {t.isPublished ? 'PUBLISHED' : t.isApproved ? 'APPROVED' : 'PENDING'}
                                        </span>
                                        <span className="font-pixel text-[10px] text-navy/50">
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg text-navy mb-1">{t.heading}</h3>
                                    <p className="font-body text-sm text-navy/80 mb-3 whitespace-pre-wrap">{t.content}</p>

                                    <div className="flex items-center gap-4 text-xs font-pixel text-navy/60">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-navy">BY:</span> {t.name}
                                        </div>
                                        {t.email && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-navy">PROG:</span> {t.email}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                                    {/* Actions */}
                                    {!t.isApproved && (
                                        <Button
                                            onClick={() => handleStatusUpdate(t.id, true, false)}
                                            className="bg-retro-yellow text-navy border-4 border-navy hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#1E3A8A] font-pixel text-xs justify-start"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> APPROVE
                                        </Button>
                                    )}

                                    {t.isApproved && !t.isPublished && (
                                        <Button
                                            onClick={() => handleStatusUpdate(t.id, true, true)}
                                            className="bg-retro-mint text-navy border-4 border-navy hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#1E3A8A] font-pixel text-xs justify-start"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> PUBLISH
                                        </Button>
                                    )}

                                    {t.isPublished && (
                                        <Button
                                            onClick={() => handleStatusUpdate(t.id, true, false)}
                                            className="bg-retro-cream text-navy border-4 border-navy hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#1E3A8A] font-pixel text-xs justify-start"
                                        >
                                            <EyeOff className="w-4 h-4 mr-2" /> UNPUBLISH
                                        </Button>
                                    )}

                                    {(t.isApproved || t.isPublished) && (
                                        <Button
                                            onClick={() => handleStatusUpdate(t.id, false, false)}
                                            className="bg-white text-navy border-4 border-navy hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#1E3A8A] font-pixel text-xs justify-start"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> REJECT/HIDE
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
