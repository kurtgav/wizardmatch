'use client';

import Link from 'next/link';
import { Heart, Mail, Instagram, Facebook, Github, Flower2, Flower, Wand2, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  platform: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/statistics', label: 'Statistics' },
    { href: '/testimonials', label: 'Testimonials' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/contact', label: 'Contact' },
  ],
};

const socialLinks = [
  { href: 'https://www.instagram.com/mapuamcl_ssc/', icon: Instagram, label: 'Instagram' },
  { href: 'https://https://www.facebook.com/MapuaMCLSSC', icon: Facebook, label: 'Facebook' },
  { href: 'mailto:ssc@mcl.edu.ph', icon: Mail, label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="bg-navy border-t-8 border-retro-yellow relative overflow-hidden">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #FFD700 1px, transparent 1px),
            linear-gradient(to bottom, #FFD700 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Floating Pixel Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pixel Hearts */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`footer-heart-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <div className="w-4 h-4 bg-retro-pink border-2 border-retro-yellow" />
          </motion.div>
        ))}

        {/* Pixel Sparkles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`footer-sparkle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <div className="w-4 h-4 bg-retro-yellow border-2 border-white" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Retro Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 bg-retro-pink border-4 border-retro-yellow flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A] p-2">
                  <img src="/images/wizardmatch-logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="font-display font-bold text-xl text-white leading-tight">
                    Wizard Match
                  </div>
                  <div className="flex items-center gap-1 text-xs text-retro-pink mt-1">
                    <Wand2 className="w-3 h-3" />
                    <span className="font-pixel text-[10px]">By Wizards</span>
                  </div>
                </div>
              </motion.div>
            </Link>

            <p className="font-body text-white/80 max-w-sm mb-6 leading-relaxed text-sm">
              Finding your perfect wizard match since 2026. Our Love Witch uses magical
              compatibility algorithms to bring Wizards together.
            </p>

            {/* Retro Trust Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-retro-plum border-4 border-retro-yellow px-4 py-2 shadow-[4px_4px_0_0_#1E3A8A]"
              whileHover={{ y: -2, x: -2, boxShadow: '6px 6px 0 0 #1E3A8A' }}
              transition={{ duration: 0.2 }}
            >
              <Flower2 className="w-4 h-4 text-retro-yellow" />
              <span className="font-pixel text-xs text-white font-bold">
                Bloom With Love
              </span>
            </motion.div>
          </div>

          {/* Retro Links */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            {/* Platform Links */}
            <div>
              <h3 className="font-pixel text-sm text-retro-pink mb-4 flex items-center gap-2">
                <Flower className="w-4 h-4 text-retro-yellow" />
                PLATFORM
              </h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-white/80 hover:text-retro-yellow hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 group text-sm"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        ►
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-pixel text-sm text-retro-pink mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-retro-pink fill-current" />
                LEGAL
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-white/80 hover:text-retro-yellow hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 group text-sm"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        ►
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social & Contact - Retro Style */}
          <div>
            <h3 className="font-pixel text-sm text-retro-pink mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-retro-yellow" />
              CONNECT
            </h3>

            {/* Retro Social Links */}
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border-4 border-retro-yellow bg-retro-sky flex items-center justify-center text-navy hover:bg-retro-pink hover:border-retro-yellow transition-all duration-300 group shadow-[4px_4px_0_0_#1E3A8A] hover:shadow-[2px_2px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1"
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 group-hover:fill-navy transition-all" />
                  </motion.a>
                );
              })}
            </div>

            {/* Retro Email Card */}
            <motion.div
              className="bg-retro-lavender border-4 border-retro-yellow p-4 shadow-[4px_4px_0_0_#1E3A8A]"
              whileHover={{ y: -2, x: -2, boxShadow: '6px 6px 0 0 #1E3A8A' }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-pixel text-xs text-navy/70 mb-1">EMAIL US AT</p>
              <a
                href="mailto:perfectmatch@gmail.com"
                className="font-pixel text-xs text-navy font-bold hover:text-cardinal-red transition-colors"
              >
                perfectmatch@gmail.com
              </a>
            </motion.div>
          </div>
        </div>

        {/* Retro Bottom Bar */}
        <div className="pt-8 border-t-4 border-retro-yellow">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              className="font-body text-sm text-white/60 flex items-center gap-2"
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              © 2026 Wizard Match. All rights reserved.
            </motion.p>

            <motion.div
              className="flex items-center gap-2"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <p className="font-pixel text-xs text-white/60 flex items-center gap-1">
                Created {' '}
                <Heart className="w-4 h-4 fill-retro-pink text-retro-pink animate-pulse" />{' '}
                by Kurt Gavin
              </p>
              <Flower className="w-4 h-4 text-retro-yellow" />
            </motion.div>
          </div>
        </div>

        {/* Retro Magic Bottom Decoration */}
        <motion.div
          className="flex justify-center mt-8"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Pixel Pattern */}
            <div className="w-4 h-4 bg-retro-pink border-2 border-retro-yellow" />
            <Flower2 className="w-5 h-5 text-retro-plum" />
            <Heart className="w-5 h-5 text-retro-pink fill-current" />
            <Wand2 className="w-5 h-5 text-retro-yellow" />
            <Heart className="w-5 h-5 text-retro-pink fill-current" />
            <Flower2 className="w-5 h-5 text-retro-plum" />
            <div className="w-4 h-4 bg-retro-sky border-2 border-retro-yellow" />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
