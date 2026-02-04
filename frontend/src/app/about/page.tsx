'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart, Flower2, Shield, Users, Zap, Ghost, Gamepad2, Wand2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Pixel Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #1E3A8A 1px, transparent 1px),
                linear-gradient(to bottom, #1E3A8A 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }} />
          </div>

          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Retro Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block bg-retro-plum border-4 border-navy px-8 py-3 shadow-[6px_6px_0_0_#1E3A8A] mb-8"
              >
                <div className="flex items-center gap-3">
                  <Ghost className="w-5 h-5 text-white animate-bounce" />
                  <p className="font-pixel text-xs text-white">
                    OUR STORY
                  </p>
                  <Flower2 className="w-5 h-5 text-retro-yellow" />
                </div>
              </motion.div>

              <h1 className="font-display font-black text-5xl md:text-6xl text-navy mb-6">
                About{' '}
                <span className="text-cardinal-red bg-retro-pink px-3">Wizard Match</span>
              </h1>
              <p className="font-body text-xl text-navy/80 leading-relaxed max-w-2xl mx-auto">
                Finding your perfect wizard match since 2026. Built with magical love for all Wizards!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-retro-lavender border-8 border-navy p-8 shadow-[12px_12px_0_0_#1E3A8A] relative overflow-hidden"
            >
              {/* Corner decorations */}
              <motion.div
                className="absolute top-0 left-0 w-8 h-8 bg-retro-orange border-4 border-r-0 border-b-0 border-navy"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-8 h-8 bg-retro-mint border-4 border-l-0 border-t-0 border-navy"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />

              <h2 className="font-pixel text-2xl text-navy mb-6 flex items-center gap-3">
                <Wand2 className="w-6 h-6 text-cardinal-red" />
                OUR MAGICAL ORIGIN
              </h2>

              <div className="space-y-4 text-navy">
                <p className="font-body text-lg leading-relaxed">
                  Wizard Match was created to bring Wizards together in a meaningful way. Inspired by similar programs at other universities, we wanted to create something special for our magical community.
                </p>
                <p className="font-body text-lg leading-relaxed">
                  Our mission is simple: help students find genuine connections based on compatibility, shared values, and common interests. Whether you're looking for love, friendship, or just want to meet new people, Wizard Match is here to help.
                </p>
                <p className="font-body text-lg leading-relaxed">
                  We believe that everyone deserves to find their people. That's why we built a smart, thoughtful matching system that considers who you are, what you value, and what you're looking for.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-pixel text-2xl text-navy mb-4 flex items-center justify-center gap-3">
                <Gamepad2 className="w-7 h-7 text-cardinal-red" />
                HOW TO PLAY
              </h2>
              <p className="font-body text-lg text-navy/80">
                Four simple steps to find your perfect match
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Sign In',
                  description: 'Use any personal Google Account',
                  icon: Users,
                  color: 'bg-retro-pink',
                },
                {
                  step: '2',
                  title: 'Take Survey',
                  description: 'Answer 30 magical questions',
                  icon: Flower2,
                  color: 'bg-retro-sky',
                },
                {
                  step: '3',
                  title: 'Get Matches',
                  description: 'Receive your top 10 matches',
                  icon: Heart,
                  color: 'bg-retro-lavender',
                },
                {
                  step: '4',
                  title: 'Connect',
                  description: 'Start your magical journey',
                  icon: Zap,
                  color: 'bg-retro-yellow',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, x: -2 }}
                  className={`${item.color} border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[10px_10px_0_0_#1E3A8A] transition-all relative`}
                >
                  {/* Corner decoration */}
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-white border-2 border-navy" />
                  </div>

                  <div className="w-16 h-16 bg-white border-4 border-navy flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_0_#1E3A8A]">
                    <item.icon className="w-8 h-8 text-navy" />
                  </div>
                  <div className="font-pixel text-5xl text-navy mb-2">
                    {item.step}
                  </div>
                  <h3 className="font-display font-bold text-xl text-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-navy/80">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="py-20 bg-retro-cream border-y-8 border-navy">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display font-black text-4xl md:text-5xl text-navy mb-6">
                Meet the <span className="text-retro-pink">Cupids</span>
              </h2>
              <p className="font-display text-xl text-navy max-w-2xl mx-auto leading-relaxed">
                We are Mapúa Malayan Colleges Laguna students, and soon we are planning to expand this website to bring even more magic to your connections.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {/* Kurt Gavin */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-48 h-48 rounded-full border-8 border-navy overflow-hidden bg-retro-sky mb-6 relative shadow-[8px_8px_0_0_#1E3A8A]">
                  {/* Placeholder for Kurt */}
                  <div className="absolute inset-0 flex items-center justify-center bg-retro-sky">
                    <img src="/kurt - founder.jpg" alt="Kurt Gavin" className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<svg class="w-24 h-24 text-navy/20" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                      }}
                    />
                  </div>
                </div>
                <h3 className="font-display font-black text-3xl text-cardinal-red mb-2">
                  Kurt Gavin
                </h3>
                <p className="font-pixel text-sm text-navy/60 uppercase tracking-widest mb-2">
                  Computer Science
                </p>
                <p className="font-display font-bold text-navy">
                  Founder & Solo Developer
                </p>
              </motion.div>

              {/* Nicole Franchezka */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-48 h-48 rounded-full border-8 border-navy overflow-hidden bg-retro-pink mb-6 relative shadow-[8px_8px_0_0_#1E3A8A]">
                  {/* Placeholder for Nicole */}
                  <div className="absolute inset-0 flex items-center justify-center bg-retro-pink">
                    <img src="/nicole-pres.jpg" alt="Nicole Franchezka" className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<svg class="w-24 h-24 text-navy/20" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                      }}
                    />
                  </div>
                </div>
                <h3 className="font-display font-black text-3xl text-cardinal-red mb-2">
                  Nicole Franchezka
                </h3>
                <p className="font-pixel text-sm text-navy/60 uppercase tracking-widest mb-2">
                  Psychology
                </p>
                <p className="font-display font-bold text-navy">
                  President - SSC
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Privacy & Safety */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-pixel text-2xl text-navy mb-8 flex items-center gap-3">
                <Shield className="w-8 h-8 text-cardinal-red" />
                YOUR PRIVACY & SAFETY
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-retro-pink border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]"
                >
                  <h3 className="font-pixel text-sm text-navy mb-3">
                    COMPLETE CONTROL
                  </h3>
                  <p className="font-body text-navy/80 text-sm">
                    You decide what information to share. Your profile is only revealed when you choose to reveal it.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-retro-sky border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]"
                >
                  <h3 className="font-pixel text-sm text-navy mb-3">
                    SECURE & PRIVATE
                  </h3>
                  <p className="font-body text-navy/80 text-sm">
                    All data is encrypted and stored securely. We never share your information with third parties.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-retro-yellow border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]"
                >
                  <h3 className="font-pixel text-sm text-navy mb-3">
                    REPORT & BLOCK
                  </h3>
                  <p className="font-body text-navy/80 text-sm">
                    If someone makes you uncomfortable, you can report or block them at any time. Safety is magical!
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-pixel text-2xl text-navy mb-4">
                {'►'} FREQUENTLY ASKED QUESTIONS {'◄'}
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: 'Who can participate?',
                  a: 'Anyone can participate! Just use your personal Google Account and complete the survey.',
                },
                {
                  q: 'How are matches determined?',
                  a: 'Our magical algorithm considers your responses to 30 questions across 5 categories: Core Values, Lifestyle, Personality, Academic/Career goals, and Fun preferences.',
                },
                {
                  q: 'When do I get my matches?',
                  a: 'Matches are revealed on February 5, 2026. After completing the survey, you\'ll be able to view your matches starting from that date.',
                },
                {
                  q: 'Can I opt out?',
                  a: 'Yes, you can delete your account and all associated data at any time through your profile settings.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-4 border-navy shadow-[6px_6px_0_0_#1E3A8A] overflow-hidden"
                >
                  <details className="group">
                    <summary className="font-pixel text-sm text-navy p-6 cursor-pointer list-none flex justify-between items-center hover:bg-retro-lavender transition-colors">
                      {faq.q}
                      <span className="text-cardinal-red group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="font-body text-navy/80 leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
