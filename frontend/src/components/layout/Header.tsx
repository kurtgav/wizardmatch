'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Sparkles, Wand2, Ghost } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/statistics', label: 'Stats' },
  { href: '/about', label: 'About' },
  { href: '/testimonials', label: 'Stories' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-retro-cream/95 backdrop-blur-md border-b-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]'
          : 'bg-retro-cream/80 backdrop-blur-sm border-b-4 border-navy'
      }`}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Retro Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="relative w-14 h-14 bg-retro-pink border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]"
              whileHover={{
                rotate: [0, -5, 5, -5, 0],
                y: -2,
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-pixel text-lg text-navy font-bold">MM</span>

              {/* Floating corner decoration */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-retro-yellow border-2 border-navy"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </motion.div>

            <div className="hidden sm:block">
              <div className="font-display font-bold text-xl text-navy leading-tight">
                Perfect Match
              </div>
              <div className="flex items-center gap-1 text-xs text-cardinal-red">
                <Wand2 className="w-3 h-3" />
                <span className="font-pixel text-[10px]">By Mapúa MCL</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Retro Style */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 font-pixel text-xs transition-all duration-300 ${
                    active
                      ? 'text-white bg-navy border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]'
                      : 'text-navy hover:text-white hover:bg-navy hover:border-4 hover:border-navy hover:shadow-[4px_4px_0_0_#1E3A8A]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-retro-yellow"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA - Retro Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/matches"
              className="relative inline-flex items-center gap-2 bg-retro-yellow text-navy px-5 py-2.5 border-4 border-navy font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 group"
            >
              <span className="flex items-center gap-2">
                MATCHES
                <Heart className="w-4 h-4 fill-cardinal-red text-cardinal-red animate-pulse" />
              </span>
              {/* Animated pixel corner */}
              <motion.div
                className="absolute top-0 right-0 w-3 h-3 bg-cardinal-red"
                animate={{
                  scale: [1, 0, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </Link>
          </div>

          {/* Mobile Menu Button - Retro Style */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative p-2.5 text-navy bg-retro-yellow border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] hover:shadow-[2px_2px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-navy/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Retro Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-retro-cream border-l-4 border-navy shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="sticky top-0 bg-retro-cream border-b-4 border-navy px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-retro-pink border-4 border-navy flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]">
                    <span className="font-pixel text-sm text-navy font-bold">WM</span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg text-navy">
                      Perfect Match
                    </div>
                    <div className="flex items-center gap-1 text-xs text-cardinal-red">
                      <Wand2 className="w-3 h-3" />
                      <span className="font-pixel text-[10px]">By Mapúa MCL</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-navy bg-retro-yellow border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] hover:shadow-[2px_2px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Mobile Menu Links - Pixel Style */}
              <div className="px-6 py-6 space-y-3">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Ghost className="w-4 h-4 text-cardinal-red" />
                    <p className="font-pixel text-xs text-navy/60 uppercase">
                      Navigation
                    </p>
                  </div>
                  <div className="space-y-2">
                    {navLinks.map((link, index) => {
                      const active = isActive(link.href);
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 border-4 border-navy font-pixel text-xs transition-all duration-300 ${
                              active
                                ? 'bg-navy text-white shadow-[4px_4px_0_0_#1E3A8A]'
                                : 'bg-white text-navy hover:bg-retro-yellow hover:shadow-[4px_4px_0_0_#1E3A8A]'
                            }`}
                          >
                            {link.label}
                            {active && <Heart className="w-4 h-4 fill-retro-yellow ml-auto" />}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile CTA - Retro Button */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-4 border-t-4 border-navy"
                >
                  <Link
                    href="/matches"
                    className="flex items-center justify-center gap-2 w-full bg-retro-yellow text-navy border-4 border-navy px-6 py-4 font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300"
                  >
                    <span>VIEW MATCHES</span>
                    <Heart className="w-5 h-5 fill-cardinal-red text-cardinal-red animate-pulse" />
                  </Link>
                </motion.div>

                {/* Decorative Pixel Pattern */}
                <motion.div
                  className="mt-8 flex justify-center"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-retro-pink border-2 border-navy" />
                    <Sparkles className="w-5 h-5 text-retro-plum" />
                    <Heart className="w-5 h-5 text-cardinal-red fill-current" />
                    <Sparkles className="w-5 h-5 text-retro-plum" />
                    <div className="w-4 h-4 bg-retro-sky border-2 border-navy" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
