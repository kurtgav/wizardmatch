'use client';

import { useAuthState } from '@/hooks/useAuthState';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { isAdminEmail } from '@/lib/admin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthState();
    const router = useRouter();

    const isAdmin = useMemo(() => isAdminEmail(user?.email), [user?.email]);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                router.push('/auth/login');
            } else if (!isAdmin) {
                // Logged in but not admin
                router.push('/');
            }
        }
    }, [user, loading, router, isAdmin]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-retro-cream">
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-navy border-t-cardinal-red rounded-full animate-spin"></div>
                        <p className="font-pixel text-navy animate-pulse">Verifying Access...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Double check rendering
    if (!user || !isAdmin) return null;

    return <>{children}</>;
}
