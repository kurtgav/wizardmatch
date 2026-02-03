'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flower2, Heart, TrendingUp, Wand2, Shield, Users, Zap, Gamepad2 } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Wand2,
      title: 'Magical Algorithm',
      description: 'Our Love Witch crafted a special potion analyzing 30+ questions across 5 categories.',
      color: 'bg-retro-pink',
      border: 'border-retro-plum',
      delay: 0.1,
    },
    {
      icon: Heart,
      title: 'Values-Based',
      description: 'We match you based on what truly matters: values, lifestyle, personality, and quirks.',
      color: 'bg-retro-sky',
      border: 'border-navy',
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      title: 'Success Stories',
      description: 'Countless Wizards have found meaningful connections through Wizard Match.',
      color: 'bg-retro-lavender',
      border: 'border-retro-plum',
      delay: 0.3,
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your information is enchanted with powerful protection. You control what you share.',
      color: 'bg-retro-mint',
      border: 'border-navy',
      delay: 0.4,
    },
    {
      icon: Users,
      title: 'Verified Community',
      description: 'Verified accounts. Our Love Witch ensures authenticity.',
      color: 'bg-retro-yellow',
      border: 'border-navy',
      delay: 0.5,
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'On February 5th, instantly see your compatibility scores and shared interests!',
      color: 'bg-retro-aqua',
      border: 'border-navy',
      delay: 0.6,
    },
  ];

  return (
    <section className="relative bg-retro-cream py-20 overflow-hidden">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #E52037 1px, transparent 1px),
            linear-gradient(to bottom, #E52037 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Floating Retro Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`float-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <div className={`w-4 h-4 ${i % 2 === 0 ? 'bg-retro-pink' : 'bg-retro-sky'
              } border-2 border-navy`} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Retro Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Pixel Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-retro-yellow border-4 border-navy px-8 py-3 shadow-[6px_6px_0_0_#1E3A8A] mb-8"
          >
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-navy" />
              <p className="font-pixel text-xs text-navy">
                FLOWER-UPS & FEATURES
              </p>
              <Flower2 className="w-5 h-5 text-cardinal-red" />
            </div>
          </motion.div>

          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-navy mb-6">
            Why Choose Our{' '}
            <span className="text-cardinal-red">Love Witch?</span>
          </h2>

          <p className="font-body text-lg md:text-xl text-navy/80 max-w-3xl mx-auto">
            Wizard Match uses a smart compatibility algorithm. Last year, we matched{' '}
            <span className="font-bold text-cardinal-red bg-retro-pink px-2">500+</span> Wizards!
          </p>
        </motion.div>

        {/* Retro Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -8, x: -4 }}
            >
              <div className={`relative ${feature.color} border-4 ${feature.border} p-6 shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[12px_12px_0_0_#1E3A8A] transition-all h-full`}>
                {/* Pixel Icon */}
                <motion.div
                  className={`inline-flex p-3 border-4 ${feature.border} bg-white mb-4`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-8 h-8 text-navy" />
                </motion.div>

                {/* Content */}
                <h3 className="font-pixel text-sm text-navy mb-3 leading-relaxed">
                  {feature.title}
                </h3>

                <p className="font-body text-navy/90 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Corner Decorations */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-white border-2 border-navy" />
                </div>
                <div className="absolute bottom-2 left-2">
                  <div className="w-3 h-3 bg-white border-2 border-navy" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Retro Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-retro-plum border-8 border-navy p-10 shadow-[12px_12px_0_0_#1E3A8A] relative overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
              `,
              backgroundSize: '16px 16px',
            }} />
          </div>

          {/* Corner Decorations */}
          <motion.div
            className="absolute top-0 left-0 w-8 h-8 bg-retro-orange border-4 border-r-0 border-b-0 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-8 h-8 bg-retro-aqua border-4 border-l-0 border-b-0 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-8 h-8 bg-retro-mint border-4 border-r-0 border-t-0 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-8 h-8 bg-retro-yellow border-4 border-l-0 border-t-0 border-navy"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5,
            }}
          />

          <div className="relative z-10">
            <h3 className="font-pixel text-xl md:text-2xl text-navy text-center mb-8">
              {'►'} HIGH SCORES {'◄'}
            </h3>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-retro-sky border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]"
              >
                <p className="font-pixel text-4xl text-navy mb-2">30+</p>
                <p className="font-body text-sm text-navy font-semibold">Magic Questions</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-retro-pink border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]"
              >
                <p className="font-pixel text-4xl text-navy mb-2">5</p>
                <p className="font-body text-sm text-navy font-semibold">Categories</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-retro-yellow border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]"
              >
                <p className="font-pixel text-4xl text-navy mb-2">500+</p>
                <p className="font-body text-sm text-navy font-semibold">Matches</p>
              </motion.div>
            </div>

            <div className="text-center">
              <Link
                href="/statistics"
                className="inline-flex items-center gap-4 bg-white text-navy px-10 py-4 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all group"
              >
                <span>VIEW STATS</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xl"
                >
                  ►
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Retro Bottom Pixel Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-retro-lavender fill-current"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,30 L30,10 L60,30 L90,10 L120,30 L150,10 L180,30 L210,10 L240,30 L270,10 L300,30 L330,10 L360,30 L390,10 L420,30 L450,10 L480,30 L510,10 L540,30 L570,10 L600,30 L630,10 L660,30 L690,10 L720,30 L750,10 L780,30 L810,10 L840,30 L870,10 L900,30 L930,10 L960,30 L990,10 L1020,30 L1050,10 L1080,30 L1110,10 L1140,30 L1170,10 L1200,30 L1230,10 L1260,30 L1290,10 L1320,30 L1350,10 L1380,30 L1410,10 L1440,30 L1440,60 L0,60 Z"
            animate={{
              d: [
                'M0,30 L30,10 L60,30 L90,10 L120,30 L150,10 L180,30 L210,10 L240,30 L270,10 L300,30 L330,10 L360,30 L390,10 L420,30 L450,10 L480,30 L510,10 L540,30 L570,10 L600,30 L630,10 L660,30 L690,10 L720,30 L750,10 L780,30 L810,10 L840,30 L870,10 L900,30 L930,10 L960,30 L990,10 L1020,30 L1050,10 L1080,30 L1110,10 L1140,30 L1170,10 L1200,30 L1230,10 L1260,30 L1290,10 L1320,30 L1350,10 L1380,30 L1410,10 L1440,30 L1440,60 L0,60 Z',
                'M0,10 L30,30 L60,10 L90,30 L120,10 L150,30 L180,10 L210,30 L240,10 L270,30 L300,10 L330,30 L360,10 L390,30 L420,10 L450,30 L480,10 L510,30 L540,10 L570,30 L600,10 L630,30 L660,10 L690,30 L720,10 L750,30 L780,10 L810,30 L840,10 L870,30 L900,10 L930,30 L960,10 L990,30 L1020,10 L1050,30 L1080,10 L1110,30 L1140,10 L1170,30 L1200,10 L1230,30 L1260,10 L1290,30 L1320,10 L1350,30 L1380,10 L1410,30 L1440,10 L1440,60 L0,60 Z',
                'M0,30 L30,10 L60,30 L90,10 L120,30 L150,10 L180,30 L210,10 L240,30 L270,10 L300,30 L330,10 L360,30 L390,10 L420,30 L450,10 L480,30 L510,10 L540,30 L570,10 L600,30 L630,10 L660,30 L690,10 L720,30 L750,10 L780,30 L810,10 L840,30 L870,10 L900,30 L930,10 L960,30 L990,10 L1020,30 L1050,10 L1080,30 L1110,10 L1140,30 L1170,10 L1200,30 L1230,10 L1260,30 L1290,10 L1320,30 L1350,10 L1380,30 L1410,10 L1440,30 L1440,60 L0,60 Z',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>
    </section>
  );
}
