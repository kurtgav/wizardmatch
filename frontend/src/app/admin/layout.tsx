'use client';

import { useAuthState } from '@/hooks/useAuthState';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthState();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                router.push('/auth/login');
            } else if (user.email !== 'kurtgavin.design@gmail.com') {
                // Logged in but not admin
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-retro-cream">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-navy border-t-cardinal-red rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // Double check rendering
    if (!user || user.email !== 'kurtgavin.design@gmail.com') return null;

    return <>{children}</>;
}
