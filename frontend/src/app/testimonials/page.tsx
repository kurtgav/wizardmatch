'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart, MessageCircle, Star, Quote, Flower2, Ghost, Gamepad2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';

// Hardcoded testimonials removed in favor of dynamic fetching
// const testimonials = [...];

export default function TestimonialsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    program: '',
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  // Use state for testimonials
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Retro colors for random assignment
  const retroColors = ['bg-retro-pink', 'bg-retro-sky', 'bg-retro-lavender', 'bg-retro-yellow', 'bg-retro-mint', 'bg-retro-aqua'];

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await api.getPublicTestimonials();
        if (response.success) {
          // Add random color and badge if not present (since DB schema might not have them)
          const processed = response.data.map((t: any, i: number) => ({
            ...t,
            color: retroColors[i % retroColors.length],
            badge: '98%', // Default badge or could be randomized
            author: t.name, // Map DB 'name' to 'author' used in UI
            program: t.email || 'Wizard', // DB uses email field for program based on admin controller logic
            heading: t.heading,
            content: t.content
          }));
          setTestimonials(processed);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.authorName.trim() || !formData.content.trim()) {
      error('Name and story are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.submitTestimonial({
        authorName: formData.authorName.trim() || 'Anonymous',
        program: formData.program.trim() || undefined,
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
      });

      success('Story submitted! It will be reviewed before publishing.');
      setFormData({ authorName: '', program: '', title: '', content: '' });

      setTimeout(() => {
        setShowForm(false);
      }, 1500);
    } catch (err: any) {
      error(err.message || 'Failed to submit testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Retro Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* Pixel Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block bg-retro-plum border-4 border-navy px-8 py-3 shadow-[6px_6px_0_0_#1E3A8A] mb-8"
            >
              <div className="flex items-center gap-3">
                <Ghost className="w-5 h-5 text-white animate-bounce" />
                <p className="font-pixel text-xs text-white">
                  BLOOM STORIES
                </p>
                <Flower2 className="w-5 h-5 text-retro-yellow" />
              </div>
            </motion.div>

            <Quote className="w-20 h-20 text-cardinal-red mx-auto mb-6" />
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-navy mb-4">
              Success{' '}
              <span className="text-cardinal-red bg-retro-pink px-3">Stories</span>
            </h1>
            <p className="font-body text-xl text-navy/80">
              Real stories from Wizards who found their match
            </p>
          </motion.div>

          {/* Stats Bar - Retro Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-retro-yellow border-8 border-navy p-8 mb-16 shadow-[12px_12px_0_0_#1E3A8A] relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                  linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                `,
                backgroundSize: '20px 20px',
              }} />
            </div>

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

            <div className="relative z-10">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
                  <p className="font-pixel text-5xl text-retro-pink mb-2">
                    98%
                  </p>
                  <p className="font-body text-sm text-navy">Satisfaction</p>
                </div>
                <div className="bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
                  <p className="font-pixel text-5xl text-retro-sky mb-2">
                    500+
                  </p>
                  <p className="font-body text-sm text-navy">Matches Made</p>
                </div>
                <div className="bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
                  <p className="font-pixel text-5xl text-retro-lavender mb-2">
                    50+
                  </p>
                  <p className="font-body text-sm text-navy">Success Stories</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonials Grid - Retro Cards */}
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-12 h-12 text-navy animate-spin" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center p-12 bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] mb-16">
              <p className="font-pixel text-navy mb-4">NO STORIES YET. BE THE FIRST!</p>
              <Button onClick={() => setShowForm(true)} className="bg-retro-pink text-navy border-4 border-navy font-pixel">
                WRITE A STORY
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, x: -4 }}
                  className={`${testimonial.color} border-4 border-navy p-6 shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[12px_12px_0_0_#1E3A8A] transition-all relative`}
                >
                  {/* Match Badge - Pixel Style */}
                  <motion.div
                    className="absolute top-3 right-3 bg-white border-4 border-navy px-3 py-2 shadow-[4px_4px_0_0_#1E3A8A]"
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

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-retro-yellow fill-current border border-navy" />
                    ))}
                  </div>

                  <h3 className="font-pixel text-xs text-navy mb-3 leading-relaxed">
                    {testimonial.heading}
                  </h3>

                  <p className="font-body text-navy/90 leading-relaxed mb-6 text-sm">
                    {testimonial.content}
                  </p>

                  {/* Author - Pixel Style */}
                  <div className="flex items-center gap-3 pt-4 border-t-4 border-navy">
                    <motion.div
                      className="w-12 h-12 border-4 border-navy bg-white flex items-center justify-center shadow-[4px_4px_0_0_#1E3A8A]"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Heart className="w-6 h-6 text-cardinal-red fill-current" />
                    </motion.div>
                    <div>
                      <p className="font-pixel text-xs text-navy font-bold">
                        {testimonial.author.toUpperCase()}
                      </p>
                      <p className="font-body text-xs text-navy/70">
                        {testimonial.program}
                      </p>
                    </div>
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute bottom-2 left-2">
                    <div className="w-2 h-2 bg-white border-2 border-navy" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}



          {/* CTA Section - Retro Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-retro-plum border-8 border-navy p-12 shadow-[12px_12px_0_0_#1E3A8A] max-w-2xl mx-auto relative overflow-hidden">
              {/* Background pixel pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                    linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                  `,
                  backgroundSize: '16px 16px',
                }} />
              </div>

              {/* Floating decorative elements */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Heart className="w-8 h-8 text-retro-pink fill-current" />
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Flower2 className="w-8 h-8 text-retro-yellow" />
              </motion.div>

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

              <div className="relative z-10">
                <Gamepad2 className="w-16 h-16 text-retro-yellow mx-auto mb-6" />
                <h2 className="font-pixel text-xl md:text-2xl text-white mb-4">
                  {'►'} SHARE YOUR TALE! {'◄'}
                </h2>
                <p className="font-body text-lg text-white/90 mb-8">
                  Did you find love or friendship through Wizard Match? We want to hear about it!
                </p>
                <motion.button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-3 bg-white text-navy px-10 py-5 border-4 border-navy font-pixel text-sm shadow-[8px_8px_0_0_#1E3A8A] hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>SUBMIT YOUR STORY</span>
                  <Flower2 className="w-5 h-5 text-cardinal-red" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div >

        {/* Form Modal - Retro Style */}
        {
          showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-retro-cream border-8 border-navy p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[16px_16px_0_0_#1E3A8A] relative overflow-hidden"
              >
                {/* Background pixel pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                    linear-gradient(to right, #1E3A8A 2px, transparent 2px),
                    linear-gradient(to bottom, #1E3A8A 2px, transparent 2px)
                  `,
                    backgroundSize: '16px 16px',
                  }} />
                </div>

                <div className="relative z-10">
                  <h3 className="font-pixel text-xl text-navy mb-6 flex items-center gap-3">
                    <Ghost className="w-6 h-6 text-cardinal-red" />
                    SHARE YOUR STORY
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="font-pixel text-xs text-navy block mb-2">
                        YOUR NAME (OR ANONYMOUS) <span className="text-cardinal-red">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none font-body"
                        placeholder="Enter your name"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="font-pixel text-xs text-navy block mb-2">
                        PROGRAM
                      </label>
                      <input
                        type="text"
                        value={formData.program}
                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none font-body"
                        placeholder="Your program"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="font-pixel text-xs text-navy block mb-2">
                        STORY TITLE
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none font-body"
                        placeholder="e.g., Matched on values!"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="font-pixel text-xs text-navy block mb-2">
                        YOUR STORY <span className="text-cardinal-red">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={5}
                        className="w-full p-3 border-4 border-navy bg-white focus:border-retro-pink focus:outline-none resize-none font-body"
                        placeholder="Tell us about your Wizard Match experience..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-retro-yellow text-navy px-6 py-3 border-4 border-navy font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            SUBMITTING...
                          </>
                        ) : (
                          'SUBMIT STORY'
                        )}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setFormData({ authorName: '', program: '', title: '', content: '' });
                        }}
                        disabled={isSubmitting}
                        className="flex-1 bg-white text-navy px-6 py-3 border-4 border-navy font-pixel text-xs shadow-[6px_6px_0_0_#1E3A8A] hover:shadow-[3px_3px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      >
                        CANCEL
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Corner decorations */}
                <motion.div
                  className="absolute top-0 left-0 w-6 h-6 bg-retro-pink border-4 border-r-0 border-b-0 border-navy"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-retro-sky border-4 border-l-0 border-t-0 border-navy"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </motion.div>
            </motion.div>
          )
        }
      </main >

      <Footer />
    </div >
  );
}
