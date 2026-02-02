'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Quote, Sparkles, Wand2, Star, Ghost } from 'lucide-react';

const testimonials = [
  {
    heading: 'Love Witch Knew Best!',
    content: 'We were matched 98% and it showed. The Love Witch\'s magic brought us together - we share the same values and life goals. Three months later and still going strong!',
    badge: '98%',
    color: 'bg-retro-pink',
    border: 'border-retro-plum',
  },
  {
    heading: 'Pure Magic in Card Form',
    content: 'I was skeptical at first, but the Love Witch\'s potion found someone who complements me perfectly. We laugh at the same jokes and even prefer the same coffee!',
    badge: '95%',
    color: 'bg-retro-sky',
    border: 'border-navy',
  },
  {
    heading: 'Spell on My Heart',
    content: 'Met my girlfriend through Perfect Match. We had no idea we had so much in common until the Love Witch revealed our compatibility. Best Valentine\'s ever!',
    badge: '97%',
    color: 'bg-retro-lavender',
    border: 'border-retro-plum',
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-retro-beige py-20 overflow-hidden">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #1E3A8A 1px, transparent 1px),
            linear-gradient(to bottom, #1E3A8A 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* Floating Retro Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pixel Stars */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <div className="w-3 h-3 bg-retro-yellow border-2 border-navy" />
          </motion.div>
        ))}

        {/* Floating Hearts */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 12, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <Heart
              className={`${
                i % 2 === 0 ? 'text-retro-pink' : 'text-cardinal-red'
              } fill-current`}
              style={{ width: 16 + i * 2, height: 16 + i * 2 }}
            />
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
            className="inline-block bg-retro-plum border-4 border-navy px-8 py-3 shadow-[6px_6px_0_0_#1E3A8A] mb-8"
          >
            <div className="flex items-center gap-3">
              <Ghost className="w-5 h-5 text-white animate-bounce" />
              <p className="font-pixel text-xs text-white">
                GHOST STORIES & TALES
              </p>
              <Sparkles className="w-5 h-5 text-retro-yellow" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Quote className="w-16 h-16 text-cardinal-red mx-auto" />
          </motion.div>

          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-navy mb-4">
            Love That Started With{' '}
            <span className="text-cardinal-red bg-retro-pink px-3">A Little Magic</span>
          </h2>

          <p className="font-body text-xl md:text-2xl text-navy/80 max-w-2xl mx-auto mb-8">
            Real stories from Wizards who found their perfect match through the Love
            Witch's magical spell
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-4 bg-white text-navy px-10 py-4 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all group"
            >
              <span>SHARE YOUR TALE</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-lg"
              >
                ►
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Retro Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8, x: -4 }}
              className="relative"
            >
              {/* Pixel Card */}
              <div className={`relative ${testimonial.color} border-4 ${testimonial.border} p-6 shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[12px_12px_0_0_#1E3A8A] transition-all h-full`}>
                {/* Match Badge - Pixel Style */}
                <motion.div
                  className={`absolute top-3 right-3 ${testimonial.border} border-4 border-navy bg-white px-3 py-2 shadow-[4px_4px_0_0_#1E3A8A]`}
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <p className="font-pixel text-xs text-navy font-bold">
                    {testimonial.badge}
                  </p>
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    className="mb-4"
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  >
                    <Quote className="w-10 h-10 text-navy" />
                  </motion.div>

                  <h3 className="font-pixel text-xs text-navy mb-4 leading-relaxed">
                    {testimonial.heading}
                  </h3>

                  <p className="font-body text-navy/90 leading-relaxed mb-6 text-sm">
                    {testimonial.content}
                  </p>

                  {/* Author - Pixel Avatar */}
                  <div className="flex items-center gap-3 pt-4 border-t-4 border-navy/30">
                    <motion.div
                      className="w-12 h-12 border-4 border-navy bg-white flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Heart className="w-6 h-6 text-cardinal-red fill-current" />
                    </motion.div>
                    <div>
                      <p className="font-pixel text-xs text-navy font-bold">
                        ANON WIZARD
                      </p>
                      <p className="font-body text-sm text-navy/70">
                        Class of 2025
                      </p>
                    </div>
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-2 left-2">
                  <div className="w-2 h-2 bg-white border-2 border-navy" />
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="w-2 h-2 bg-white border-2 border-navy" />
                </div>

                {/* Floating Sparkles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      bottom: `${8 + i * 4}%`,
                      left: `${8 + i * 4}%`,
                    }}
                    animate={{
                      y: [0, -12, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <div className="w-2 h-2 bg-retro-yellow border border-navy" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Retro Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20"
        >
          <div className="bg-retro-yellow border-8 border-navy p-10 shadow-[12px_12px_0_0_#1E3A8A] relative overflow-hidden">
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
              className="absolute top-0 left-0 w-8 h-8 bg-cardinal-red border-4 border-r-0 border-b-0 border-navy"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute top-0 right-0 w-8 h-8 bg-retro-pink border-4 border-l-0 border-b-0 border-navy"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-8 h-8 bg-retro-sky border-4 border-r-0 border-t-0 border-navy"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-8 h-8 bg-retro-lavender border-4 border-l-0 border-t-0 border-navy"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.5,
              }}
            />

            <div className="relative z-10 text-center">
              <motion.div
                className="flex justify-center gap-4 mb-6"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Heart className="w-10 h-10 fill-cardinal-red text-cardinal-red" />
                <Sparkles className="w-10 h-10 text-retro-plum" />
                <Heart className="w-10 h-10 fill-cardinal-red text-cardinal-red" />
              </motion.div>

              <h3 className="font-pixel text-xl md:text-2xl text-navy mb-4">
                {'►'} READY TO PLAY? {'◄'}
              </h3>

              <p className="font-body text-lg text-navy/90 mb-8 max-w-2xl mx-auto">
                Join hundreds of Mapúa MCL Wizards and let our Love Witch work her magic
                on your Valentine's this year!
              </p>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-4 bg-white text-navy px-10 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all group"
              >
                <span>START GAME</span>
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Retro Bottom Pixel Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-retro-cream fill-current"
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
