'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Quote, Star } from 'lucide-react';
import { api } from '@/lib/api';

interface Testimonial {
  id: string;
  name: string;
  content: string;
  isPublished: boolean;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/testimonials?published=true`);
        const data = await response.json();
        if (data.success && data.data) {
          setTestimonials(data.data);
        }
      } catch (error) {
        console.error('Failed to load testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  // Default testimonials if none loaded
  const defaultTestimonials = [
    {
      id: '1',
      name: 'Sarah & Mark',
      content: 'We met through Wizard Match and have been together for 6 months now. The compatibility score was spot on!',
      isPublished: true,
    },
    {
      id: '2',
      name: 'Jenna',
      content: 'I was skeptical at first, but the matching algorithm really understood what I was looking for. Highly recommend!',
      isPublished: true,
    },
    {
      id: '3',
      name: 'Alex & Taylor',
      content: 'Best decision ever! We clicked instantly and have so much in common. Thank you Wizard Match!',
      isPublished: true,
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="relative bg-retro-plum py-20 overflow-hidden">
      {/* Pixel Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#1E3A8A 2px, transparent 2px),
            linear-gradient(90deg, #1E3A8A 2px, transparent 2px)
          `,
          backgroundSize: '16px 16px'
        }}></div>
      </div>

      {/* Floating Hearts Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bg-heart-${i}`}
            className="absolute"
            style={{
              left: `${5 + i * 18}%`,
              top: `${10 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <Heart className="w-6 h-6 text-retro-pink fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Retro Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-retro-yellow border-4 border-navy px-6 py-2 shadow-[4px_4px_0_0_#1E3A8A] mb-6"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-4 h-4 text-navy fill-navy" />
              </motion.div>
              <span className="font-pixel text-xs text-navy">SUCCESS STORIES</span>
              <motion.div
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-4 h-4 text-navy fill-navy" />
              </motion.div>
            </div>
          </motion.div>

          <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-navy mb-4">
            Love Stories from{' '}
            <span className="text-retro-pink">Our Wizards</span>
          </h2>
          <p className="font-body text-lg text-navy/80 max-w-2xl mx-auto">
            Real connections, real magic. See how Wizard Match has brought Wizards together.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {displayTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A] h-full hover:shadow-[10px_10px_0_0_#1E3A8A] hover:-translate-y-1 transition-all duration-300">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4">
                  <Quote className="w-8 h-8 text-retro-pink opacity-30" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <p className="font-body text-navy mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-retro-yellow border-3 border-navy flex items-center justify-center shadow-[3px_3px_0_0_#1E3A8A]">
                      <Heart className="w-5 h-5 text-cardinal-red fill-current" />
                    </div>
                    <div>
                      <p className="font-pixel text-xs text-navy font-bold uppercase">
                        {testimonial.name}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-retro-yellow fill-retro-yellow" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-block bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
            <p className="font-pixel text-sm text-navy mb-4">
              Want to share your story?
            </p>
            <a
              href="/testimonials"
              className="inline-flex items-center gap-2 bg-retro-pink text-white border-4 border-navy px-6 py-3 font-pixel text-xs shadow-[4px_4px_0_0_#1E3A8A] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <Heart className="w-4 h-4 fill-current" />
              SUBMIT YOUR STORY
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
