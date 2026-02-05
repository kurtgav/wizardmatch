'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Flower2, Ghost, User, LogOut, Settings, Activity, MessageCircle, BarChart2, Info, FileText, Gift, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Define all navigation links as requested by the user
const allLinks = [
  { href: '/', label: 'Home', icon: Home, public: true },
  { href: '/statistics', label: 'Stats', icon: BarChart2, public: true },
  { href: '/about', label: 'About', icon: Info, public: true },
  { href: '/testimonials', label: 'Stories', icon: Heart, public: true },
  { href: '/survey', label: 'Form', icon: FileText, public: true },
  { href: '/matches', label: 'Matches', icon: Heart, public: true },
  { href: '/messages', label: 'Messages', icon: MessageCircle, public: false },
  { href: '/crush-list', label: 'Crush List', icon: Gift, public: false },
  { href: '/profile', label: 'Profile', icon: User, public: false },
];

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // For desktop, show public links + private links if logged in
  const desktopLinks = allLinks.filter(link => link.public || (user && !link.public));

  // Admin emails list
  const ADMIN_EMAILS = ['kurtgavin.design@gmail.com', 'nicolemaaba@gmail.com', 'Agpfrancisco1@gmail.com'];

  // For mobile menu, show ALL links + Admin Panel if authorized
  const mobileLinks = [...allLinks];
  if (user && ADMIN_EMAILS.includes(user.email)) {
    // Insert Admin Panel before 'Profile' (which is the last item usually) or just push it. 
    // Let's push it before Profile for better visibility or at the end? 
    // The list is: Home, Stats, About, Stories, Form, Matches, Messages, Crush List, Profile.
    // Let's insert it before Profile?
    const profileIndex = mobileLinks.findIndex(link => link.label === 'Profile');
    if (profileIndex !== -1) {
      mobileLinks.splice(profileIndex, 0, { href: '/admin/dashboard', label: 'Admin Panel', icon: Activity, public: false });
    } else {
      mobileLinks.push({ href: '/admin/dashboard', label: 'Admin Panel', icon: Activity, public: false });
    }
  }

  // Track when component has mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
          ? 'bg-retro-cream border-b-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]'
          : 'bg-retro-cream border-b-4 border-navy'
          }`}
      >
        <nav className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                className="relative w-12 h-12 md:w-14 md:h-14 bg-retro-sky border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A] p-2"
                whileHover={{ rotate: [0, -5, 5, -5, 0], y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/images/wizardmatch-logo.png" alt="Logo" className="w-full h-full object-contain" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-retro-yellow border-2 border-navy"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div className="hidden sm:block">
                <div className="font-display font-black text-xl text-navy leading-tight uppercase tracking-tight">
                  Wizard Match
                </div>
                <div className="flex items-center gap-1 text-[10px] text-cardinal-red font-pixel">
                  <Flower2 className="w-3 h-3" />
                  <span>EST 2026</span>
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION - Visible only on XL+ */}
            <div className="hidden xl:flex items-center gap-2">
              {desktopLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 font-display font-black text-sm tracking-tight transition-all duration-300 border-4 border-transparent ${active
                      ? 'text-navy bg-retro-yellow border-navy shadow-[3px_3px_0_0_#1E3A8A]'
                      : 'text-navy hover:bg-white hover:border-navy hover:shadow-[3px_3px_0_0_#1E3A8A] opacity-80 hover:opacity-100'
                      }`}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                );
              })}
            </div>

            {/* ACTIONS SECTION */}
            <div className="flex items-center gap-4">
              {/* Desktop User Dropdown */}
              {isMounted && !loading && user && (
                <div className="hidden xl:relative xl:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 bg-white px-4 py-2 border-4 border-navy font-display font-black text-sm shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    <div className="w-6 h-6 bg-retro-pink border-2 border-navy overflow-hidden">
                      {user.profilePhotoUrl ? (
                        <img src={user.profilePhotoUrl} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-1 text-navy" />
                      )}
                    </div>
                    <span className="uppercase">{user.username ? user.username : user.firstName}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] z-[110]"
                      >
                        <div className="p-3 border-b-4 border-navy/10 bg-retro-cream/30">
                          <p className="font-pixel text-[9px] text-navy/50 uppercase tracking-widest">Portal Access</p>
                          <p className="font-display font-black text-sm text-navy truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <Link href="/profile" className="flex items-center gap-3 w-full px-4 py-3 font-display font-black text-xs text-navy hover:bg-retro-sky transition-colors">
                            <User className="w-4 h-4" /> VIEW PROFILE
                          </Link>
                          <Link href="/profile/edit" className="flex items-center gap-3 w-full px-4 py-3 font-display font-black text-xs text-navy hover:bg-retro-yellow transition-colors">
                            <Settings className="w-4 h-4" /> EDIT PROFILE
                          </Link>
                          {ADMIN_EMAILS.includes(user.email) && (
                            <Link href="/admin/dashboard" className="flex items-center gap-3 w-full px-4 py-3 font-display font-black text-xs text-navy hover:bg-retro-sky transition-colors">
                              <Activity className="w-4 h-4" /> ADMIN PANEL
                            </Link>
                          )}
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 font-display font-black text-xs text-cardinal-red hover:bg-red-50 transition-colors border-t-2 border-navy/5 mt-1">
                            <LogOut className="w-4 h-4" /> LOGOUT
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Login Button for Desktop */}
              {isMounted && !loading && !user && (
                <Link
                  href="/auth/login"
                  className="hidden xl:inline-flex bg-cardinal-red text-white px-6 py-2 border-4 border-navy font-display font-black text-sm shadow-[4px_4px_0_0_#1E3A8A] hover:bg-red-600 transition-all uppercase tracking-tight"
                >
                  Sign In
                </Link>
              )}

              {/* MOBILE BURGER BUTTON - Hidden on Desktop (xl) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="xl:hidden relative w-12 h-12 flex items-center justify-center bg-white border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Menu className="w-7 h-7 text-navy" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* FULL SCREEN MOBILE OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 w-full h-full bg-retro-cream z-[200] flex flex-col pt-24"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(to right, #1E3A8A 2px, transparent 2px), linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)`,
                backgroundSize: '40px 40px',
              }} />
            </div>

            {/* Close Button - Square Box with Shadow */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 w-14 h-14 bg-white border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] flex items-center justify-center z-[210] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <X className="w-8 h-8 text-cardinal-red stroke-[4]" />
            </button>

            {/* Menu Items Container */}
            <div className="flex-1 overflow-y-auto px-6 pb-20 relative z-10">
              <div className="flex flex-col gap-4 max-w-lg mx-auto">
                <p className="font-pixel text-[10px] text-navy/30 mb-2 uppercase tracking-[0.3em] text-center">System Navigation</p>

                {mobileLinks.map((link, index) => {
                  const active = isActive(link.href);
                  const isPrivate = !link.public;
                  const isLocked = isPrivate && !user;

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                    >
                      <Link
                        href={isLocked ? '/auth/login' : link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center h-20 bg-white border-4 border-navy transition-all relative ${active
                          ? 'shadow-[6px_6px_0_0_#E52037] -translate-x-1 -translate-y-1'
                          : 'shadow-[4px_4px_0_0_#1E3A8A] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1E3A8A]'
                          }`}
                      >
                        {/* Icon Box - MATCHING USER IMAGE */}
                        <div className={`w-16 h-full border-r-4 border-navy flex items-center justify-center transition-colors ${active ? 'bg-retro-pink' : 'bg-white group-hover:bg-retro-cream'
                          }`}>
                          {link.icon && <link.icon className={`w-8 h-8 ${active ? 'text-navy' : 'text-navy/60 group-hover:text-navy'}`} />}
                        </div>

                        {/* Text Label */}
                        <div className="flex-1 px-6">
                          <span className={`text-2xl font-display font-black uppercase tracking-tight ${active ? 'text-navy' : 'text-navy/80'}`}>
                            {link.label}
                          </span>
                        </div>

                        {/* Status Checkbox */}
                        <div className="pr-6">
                          {isLocked ? (
                            <Ghost className="w-5 h-5 text-navy/20" />
                          ) : active ? (
                            <div className="w-4 h-4 bg-retro-yellow border-2 border-navy animate-pulse" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-navy opacity-10" />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Footer Actions in Mobile Menu */}
                <div className="mt-8">
                  {isMounted && user ? (
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-3 w-full bg-navy text-white border-4 border-navy py-5 font-display font-black text-sm shadow-[6px_6px_0_0_#E52037]"
                    >
                      <LogOut className="w-5 h-5 text-retro-yellow" /> DISCONNECT
                    </motion.button>
                  ) : isMounted && !user ? (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-3 w-full bg-retro-yellow text-navy border-4 border-navy py-5 font-display font-black text-sm shadow-[6px_6px_0_0_#1E3A8A]"
                    >
                      <User className="w-5 h-5" /> MEMBER LOGIN
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
