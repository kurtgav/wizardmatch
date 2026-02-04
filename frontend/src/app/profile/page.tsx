'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, Instagram, Calendar, BookOpen,
    GraduationCap, Heart, Edit, MapPin, MessageCircle, Globe, Eye, EyeOff, FileText
} from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    program?: string;
    yearLevel?: number;
    gender?: string;
    seekingGender?: string;
    dateOfBirth?: string;
    profilePhotoUrl?: string;
    bio?: string;
    instagramHandle?: string;
    facebookProfile?: string;
    socialMediaName?: string;
    phoneNumber?: string;
    contactPreference?: string;
    profileVisibility?: string;
    surveyCompleted: boolean;
}

export default function ProfileView() {
    const { user, loading } = useAuthState();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
            return;
        }

        if (user) {
            fetchProfile();
        }
    }, [user, loading]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                // Handle wrapped response
                const data = result.success ? result.data : result;
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-retro-cream">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-navy border-t-retro-yellow animate-spin mx-auto mb-4"></div>
                        <p className="font-pixel text-navy">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col bg-retro-cream">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="font-pixel text-navy">Profile not found</p>
                </div>
            </div>
        );
    }

    const InfoCard = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number }) => {
        if (!value) return null;

        return (
            <div className="bg-white border-4 border-navy p-4 shadow-[4px_4px_0_0_#1E3A8A]">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-retro-sky border-2 border-navy flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-pixel text-[10px] text-navy/50 uppercase mb-1">{label}</p>
                        <p className="font-display font-bold text-navy break-words">{value}</p>
                    </div>
                </div>
            </div>
        );
    };

    const getVisibilityIcon = (visibility?: string) => {
        switch (visibility) {
            case 'Public':
                return Globe;
            case 'Private':
                return EyeOff;
            default:
                return Eye;
        }
    };

    const VisibilityIcon = getVisibilityIcon(profile.profileVisibility);

    return (
        <div className="min-h-screen flex flex-col bg-retro-cream">
            <Header />

            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(to right, #1E3A8A 2px, transparent 2px), linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <main className="flex-1 container mx-auto pt-32 pb-16 px-4 relative z-10">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block bg-retro-yellow border-4 border-navy px-6 py-2 shadow-[6px_6px_0_0_#1E3A8A] mb-4"
                    >
                        <p className="font-pixel text-xs text-navy uppercase tracking-widest">
                            YOUR WIZARD PROFILE
                        </p>
                    </motion.div>
                    <h1 className="font-pixel text-3xl md:text-5xl text-navy tracking-tighter">
                        PROFILE <span className="text-cardinal-red">OVERVIEW</span>
                    </h1>
                    <p className="font-body text-navy/60 max-w-md mx-auto italic">
                        This is how other wizards will see you after a match!
                    </p>

                    <motion.button
                        onClick={() => router.push('/profile/edit')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 bg-retro-pink text-white px-6 py-3 border-4 border-navy font-pixel text-sm shadow-[6px_6px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
                    >
                        <Edit className="w-4 h-4" />
                        EDIT PROFILE
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] p-6 sticky top-24">
                            {/* Corner Decorations */}
                            <div className="absolute top-2 right-2 w-4 h-4 bg-retro-pink border-2 border-navy" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 bg-retro-yellow border-2 border-navy" />

                            {/* Profile Photo */}
                            <div className="mb-6 relative z-10">
                                <div className="w-full aspect-square bg-retro-cream border-4 border-navy overflow-hidden mb-4 shadow-[6px_6px_0_0_#1E3A8A]">
                                    {profile.profilePhotoUrl ? (
                                        <img
                                            src={profile.profilePhotoUrl}
                                            alt={`${profile.firstName} ${profile.lastName}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-24 h-24 text-navy/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <h2 className="font-pixel text-2xl text-navy mb-1 uppercase text-center tracking-tight">
                                    {profile.firstName} {profile.lastName}
                                </h2>

                                {/* Student ID */}
                                {profile.studentId && (
                                    <p className="font-pixel text-xs text-navy/60 text-center mb-4">
                                        ID: {profile.studentId}
                                    </p>
                                )}

                                {/* Survey Status */}
                                <div className={`mt-4 p-3 border-4 ${profile.surveyCompleted ? 'border-green-600 bg-green-50' : 'border-cardinal-red bg-red-50'}`}>
                                    <p className="font-pixel text-xs text-center uppercase">
                                        {profile.surveyCompleted ? '✓ Survey Completed' : '⚠ Survey Incomplete'}
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div className="pt-4 border-t-4 border-navy/10 relative z-10">
                                    <p className="font-pixel text-[10px] text-navy/50 uppercase mb-2 flex items-center gap-2">
                                        <FileText className="w-3 h-3 text-retro-yellow" /> Character Bio
                                    </p>
                                    <div className="bg-retro-cream border-2 border-navy p-4">
                                        <p className="font-body text-sm text-navy leading-relaxed italic">
                                            "{profile.bio}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information */}
                        <div className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A]">
                            <h3 className="font-pixel text-xl text-navy mb-6 uppercase flex items-center gap-2">
                                <div className="w-8 h-8 bg-retro-yellow border-2 border-navy flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={Mail} label="Email" value={profile.email} />
                                <InfoCard icon={Phone} label="Phone Number" value={profile.phoneNumber} />
                                <InfoCard icon={Calendar} label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : undefined} />
                                <InfoCard icon={Heart} label="Gender" value={profile.gender} />
                                <InfoCard icon={Heart} label="Seeking" value={profile.seekingGender} />
                                <InfoCard icon={MessageCircle} label="Contact Preference" value={profile.contactPreference} />
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A]">
                            <h3 className="font-pixel text-xl text-navy mb-6 uppercase flex items-center gap-2">
                                <div className="w-8 h-8 bg-retro-sky border-2 border-navy flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                Academic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={BookOpen} label="Program" value={profile.program} />
                                <InfoCard icon={GraduationCap} label="Year Level" value={profile.yearLevel ? `Year ${profile.yearLevel}` : undefined} />
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A]">
                            <h3 className="font-pixel text-xl text-navy mb-6 uppercase flex items-center gap-2">
                                <div className="w-8 h-8 bg-retro-pink border-2 border-navy flex items-center justify-center">
                                    <Instagram className="w-4 h-4" />
                                </div>
                                Social Media
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={Instagram} label="Instagram" value={profile.instagramHandle} />
                                <InfoCard icon={User} label="Social Media Name" value={profile.socialMediaName} />
                                {profile.facebookProfile && (
                                    <InfoCard icon={User} label="Facebook" value={profile.facebookProfile} />
                                )}
                            </div>
                        </div>

                        {/* Privacy Settings */}
                        <div className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A]">
                            <h3 className="font-pixel text-xl text-navy mb-6 uppercase flex items-center gap-2">
                                <div className="w-8 h-8 bg-white border-2 border-navy flex items-center justify-center">
                                    <VisibilityIcon className="w-4 h-4" />
                                </div>
                                Privacy Settings
                            </h3>

                            <div className="flex items-center justify-between p-6 bg-retro-cream border-2 border-navy">
                                <div>
                                    <p className="font-pixel text-sm text-navy mb-1 uppercase">Profile Visibility</p>
                                    <p className="font-body text-xs text-navy/60">Who can see your profile</p>
                                </div>
                                <div className="px-4 py-2 bg-white border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]">
                                    <p className="font-pixel text-sm text-navy uppercase">
                                        {profile.profileVisibility || 'Matches Only'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
