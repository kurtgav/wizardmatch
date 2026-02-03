'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, MessageSquare, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending - in production, this would call an API
    setTimeout(() => {
      success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy hover:text-cardinal-red mb-8 font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-retro-pink border-4 border-navy p-4 shadow-[6px_6px_0_0_#1E3A8A]">
                <MessageSquare className="w-12 h-12 text-navy" />
              </div>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-navy mb-4">
              Contact Us
            </h1>
            <p className="font-body text-lg text-navy/80">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-8 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-pixel text-xs text-navy block mb-2">
                    YOUR NAME <span className="text-cardinal-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none font-body"
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="font-pixel text-xs text-navy block mb-2">
                    EMAIL <span className="text-cardinal-red">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none font-body"
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-navy block mb-2">
                  SUBJECT
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none font-body"
                  placeholder="How can we help?"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="font-pixel text-xs text-navy block mb-2">
                  MESSAGE <span className="text-cardinal-red">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none resize-none font-body"
                  placeholder="Tell us what's on your mind..."
                  disabled={isSubmitting}
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-retro-yellow text-navy px-8 py-4 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    SEND MESSAGE
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-retro-sky border-4 border-navy p-6 text-center shadow-[6px_6px_0_0_#1E3A8A]">
              <Mail className="w-8 h-8 text-navy mx-auto mb-3" />
              <h3 className="font-pixel text-sm text-navy font-bold mb-2">EMAIL</h3>
              <p className="font-body text-sm text-navy/80">admin@wizardmatch.ai</p>
            </div>

            <div className="bg-retro-mint border-4 border-navy p-6 text-center shadow-[6px_6px_0_0_#1E3A8A]">
              <MessageSquare className="w-8 h-8 text-navy mx-auto mb-3" />
              <h3 className="font-pixel text-sm text-navy font-bold mb-2">RESPONSE TIME</h3>
              <p className="font-body text-sm text-navy/80">Within 24-48 hours</p>
            </div>

            <div className="bg-retro-yellow border-4 border-navy p-6 text-center shadow-[6px_6px_0_0_#1E3A8A]">
              <Send className="w-8 h-8 text-navy mx-auto mb-3" />
              <h3 className="font-pixel text-sm text-navy font-bold mb-2">LOCATION</h3>
              <p className="font-body text-sm text-navy/80">The Magic Realm 🔮</p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
