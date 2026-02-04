'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
    Users,
    Search,
    X,
    User,
    Mail,
    GraduationCap,
    Heart,
    CheckCircle,
    XCircle,
    Eye,
    Instagram,
    Phone,
    Calendar,
    FileText,
} from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    username?: string;
    firstName: string;
    lastName: string;
    studentId: string;
    program?: string;
    yearLevel?: number;
    gender?: string;
    seekingGender?: string;
    dateOfBirth?: string;
    profilePhotoUrl?: string;
    bio?: string;
    instagramHandle?: string;
    socialMediaName?: string;
    phoneNumber?: string;
    contactPreference?: string;
    profileVisibility?: string;
    surveyCompleted: boolean;
    isActive: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuthState();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedForMatch, setSelectedForMatch] = useState<UserProfile[]>([]);

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
            loadUsers();
        }
    }, [user, authLoading, router]);

    async function loadUsers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?limit=1000`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUsers(data.data);
                }
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateMatch() {
        if (selectedForMatch.length !== 2) {
            alert('Please select exactly 2 users to match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/manual-match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user1Id: selectedForMatch[0].id,
                    user2Id: selectedForMatch[1].id,
                    compatibilityScore: 100,
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert('Match created successfully!');
                setSelectedForMatch([]);
            } else {
                alert(`Failed to create match: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to create match:', error);
            alert('Failed to create match');
        }
    }

    function toggleUserSelection(user: UserProfile) {
        if (selectedForMatch.find(u => u.id === user.id)) {
            setSelectedForMatch(selectedForMatch.filter(u => u.id !== user.id));
        } else if (selectedForMatch.length < 2) {
            setSelectedForMatch([...selectedForMatch, user]);
        } else {
            alert('You can only select 2 users at a time');
        }
    }

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.studentId.toLowerCase().includes(searchQuery.toLowerCase())
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
                        USER MANAGEMENT
                    </h1>
                    <p className="font-pixel text-sm text-navy/70">
                        Total Users: {users.length} | Showing: {filteredUsers.length}
                    </p>
                </motion.div>

                {/* Search and Actions */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/40" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or student ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-4 border-navy font-body text-navy bg-white focus:outline-none focus:bg-retro-cream"
                        />
                    </div>

                    {selectedForMatch.length === 2 && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={handleCreateMatch}
                            className="bg-cardinal-red text-white px-6 py-3 border-4 border-navy font-pixel text-sm shadow-[6px_6px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            CREATE MATCH ({selectedForMatch.length}/2)
                        </motion.button>
                    )}
                </div>

                {/* Selected Users for Matching */}
                {selectedForMatch.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mb-6 bg-retro-yellow border-4 border-navy p-4"
                    >
                        <p className="font-pixel text-xs text-navy mb-2">SELECTED FOR MATCHING:</p>
                        <div className="flex gap-4">
                            {selectedForMatch.map(user => (
                                <div key={user.id} className="bg-white border-2 border-navy px-4 py-2 flex items-center gap-2">
                                    <span className="font-display font-bold text-navy">{user.firstName} {user.lastName}</span>
                                    <button onClick={() => toggleUserSelection(user)}>
                                        <X className="w-4 h-4 text-cardinal-red" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Users List View */}
                <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A]">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 border-b-4 border-navy bg-retro-cream p-4 font-pixel text-xs text-navy uppercase">
                        <div className="col-span-1 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="col-span-4">User Details</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y-2 divide-navy">
                        {filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-navy/50 font-pixel">
                                NO USERS FOUND
                            </div>
                        ) : (
                            filteredUsers.map((user, index) => {
                                const isSelected = selectedForMatch.find(u => u.id === user.id);
                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.01 }} // Faster stagger
                                        className={`group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center transition-colors ${isSelected ? 'bg-retro-yellow/20' : 'hover:bg-retro-cream'}`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        {/* Selection & Avatar */}
                                        <div className="col-span-1 md:col-span-1 flex items-center gap-4 md:justify-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleUserSelection(user);
                                                }}
                                                className={`w-6 h-6 border-2 border-navy flex items-center justify-center bg-white transition-all ${isSelected ? 'bg-cardinal-red' : 'hover:scale-110'}`}
                                            >
                                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                            </button>

                                            {/* Mobile-only avatar view in this column or next? Let's keep it clean */}
                                        </div>

                                        {/* User Info */}
                                        <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-retro-pink border-2 border-navy flex-shrink-0 overflow-hidden">
                                                {user.profilePhotoUrl ? (
                                                    <img src={user.profilePhotoUrl} alt={user.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-navy/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-display font-bold text-navy truncate">
                                                    {user.username ? (
                                                        <span className="flex flex-col">
                                                            <span>{user.username}</span>
                                                            <span className="text-[10px] opacity-60 font-body font-normal">{user.firstName} {user.lastName}</span>
                                                        </span>
                                                    ) : (
                                                        `${user.firstName} ${user.lastName}`
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-pixel text-[10px] text-navy/60 bg-navy/5 px-1 rounded">
                                                        {user.studentId}
                                                    </span>
                                                    {user.program && (
                                                        <span className="font-body text-[10px] text-navy/50 truncate md:hidden lg:inline-block max-w-[100px]">
                                                            {user.program}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="col-span-1 md:col-span-3 min-w-0 hidden md:block">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail className="w-3 h-3 text-navy/40" />
                                                <span className="font-body text-xs text-navy truncate">{user.email}</span>
                                            </div>
                                            {user.program && (
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-3 h-3 text-navy/40" />
                                                    <span className="font-body text-xs text-navy/60 truncate">{user.program}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 md:justify-center">
                                            {user.surveyCompleted ? (
                                                <span className="w-6 h-6 rounded-full bg-retro-mint border-2 border-navy flex items-center justify-center" title="Survey Completed">
                                                    <CheckCircle className="w-4 h-4 text-navy" />
                                                </span>
                                            ) : (
                                                <span className="w-6 h-6 rounded-full bg-retro-gray border-2 border-navy flex items-center justify-center opacity-50" title="Survey Pending">
                                                    <div className="w-2 h-2 rounded-full bg-navy/20" />
                                                </span>
                                            )}

                                            {user.isActive && (
                                                <span className="px-2 py-0.5 bg-retro-sky border-2 border-navy font-pixel text-[8px] text-navy">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
                                                }}
                                                className="bg-white hover:bg-retro-yellow border-2 border-navy px-3 py-1 font-pixel text-[10px] text-navy shadow-[2px_2px_0_0_#1E3A8A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" /> VIEW
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedUser(null)}
                        className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] max-w-md w-full max-h-[85vh] overflow-y-auto relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-2 right-2 bg-cardinal-red border-2 border-navy p-1 hover:bg-red-600 transition-colors z-10"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>

                            {/* Header */}
                            <div className="bg-retro-cream border-b-4 border-navy p-6 text-center">
                                <div className="w-20 h-20 bg-retro-pink border-2 border-navy overflow-hidden mx-auto mb-3">
                                    {selectedUser.profilePhotoUrl ? (
                                        <img src={selectedUser.profilePhotoUrl} alt={selectedUser.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-8 h-8 text-navy/30" />
                                        </div>
                                    )}
                                </div>
                                <h2 className="font-display font-black text-xl text-navy mb-1 leading-tight">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </h2>
                                <p className="font-pixel text-[10px] text-navy/60">ID: {selectedUser.studentId}</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Bio */}
                                {selectedUser.bio && (
                                    <div className="bg-retro-cream border-2 border-navy p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText className="w-3 h-3 text-navy" />
                                            <h3 className="font-pixel text-[10px] text-navy/50 uppercase">Bio</h3>
                                        </div>
                                        <p className="font-body text-xs text-navy italic">"{selectedUser.bio}"</p>
                                    </div>
                                )}

                                {/* Compact Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Personal */}
                                    <div className="space-y-2">
                                        <h3 className="font-pixel text-[10px] text-navy mb-1 uppercase bg-navy/5 px-1 inline-block">Personal</h3>
                                        <div className="space-y-1">
                                            <InfoItem icon={Mail} label="Email" value={selectedUser.email} />
                                            <InfoItem icon={User} label="Gender" value={selectedUser.gender} />
                                            <InfoItem icon={Heart} label="Seeking" value={selectedUser.seekingGender} />
                                            <InfoItem icon={Calendar} label="DOB" value={selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : undefined} />
                                        </div>
                                    </div>

                                    {/* Academic & Contact */}
                                    <div className="space-y-2">
                                        <h3 className="font-pixel text-[10px] text-navy mb-1 uppercase bg-navy/5 px-1 inline-block">Academic & Contact</h3>
                                        <div className="space-y-1">
                                            <InfoItem icon={GraduationCap} label="Program" value={selectedUser.program} />
                                            <InfoItem icon={Instagram} label="Insta" value={selectedUser.instagramHandle} />
                                            <InfoItem icon={Phone} label="Phone" value={selectedUser.phoneNumber} />
                                            <InfoItem icon={Mail} label="Pref" value={selectedUser.contactPreference} />
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex gap-2 pt-2 border-t-2 border-navy/10">
                                    <div className={`flex-1 p-2 border-2 ${selectedUser.surveyCompleted ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                                        <p className="font-pixel text-[10px] text-center">
                                            {selectedUser.surveyCompleted ? '✓ Survey Done' : '✗ No Survey'}
                                        </p>
                                    </div>
                                    <div className={`flex-1 p-2 border-2 ${selectedUser.isActive ? 'border-navy bg-retro-sky' : 'border-gray-400 bg-gray-100'}`}>
                                        <p className="font-pixel text-[10px] text-center">
                                            {selectedUser.isActive ? '✓ Active' : '✗ Inactive'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
    if (!value) return null;

    return (
        <div className="bg-white border-2 border-navy p-3">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3 h-3 text-navy/40" />
                <p className="font-pixel text-[8px] text-navy/50 uppercase">{label}</p>
            </div>
            <p className="font-body text-sm text-navy truncate">{value}</p>
        </div>
    );
}
