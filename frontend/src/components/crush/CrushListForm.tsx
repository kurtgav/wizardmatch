'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Crush {
  email: string;
  name?: string;
  isRegistered?: boolean;
  isMutual?: boolean;
}

interface CrushListFormProps {
  onSubmit: (crushes: Array<{ email: string; name?: string }>) => Promise<void>;
  existingCrushes?: Crush[];
  maxCrushes?: number;
  className?: string;
}

export function CrushListForm({
  onSubmit,
  existingCrushes = [],
  maxCrushes = 10,
  className = '',
}: CrushListFormProps) {
  const [crushes, setCrushes] = useState<Crush[]>(
    existingCrushes.map((c: any) => ({
      ...c,
      email: c.email || c.crushEmail || '',
      name: c.name || c.crushName,
    }))
  );
  const [newCrushEmail, setNewCrushEmail] = useState('');
  const [newCrushName, setNewCrushName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleAddCrush = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newCrushEmail || !emailRegex.test(newCrushEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (crushes.some(c => c.email.toLowerCase() === newCrushEmail.toLowerCase())) {
      setEmailError('This email is already in your crush list');
      return;
    }

    // Check max limit
    if (crushes.length >= maxCrushes) {
      setEmailError(`Maximum ${maxCrushes} crushes allowed`);
      return;
    }

    setCrushes([...crushes, { email: newCrushEmail, name: newCrushName || undefined }]);
    setNewCrushEmail('');
    setNewCrushName('');
    setEmailError('');
  };

  const handleRemoveCrush = (email: string) => {
    setCrushes(crushes.filter(c => c.email !== email));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(crushes.map(c => ({ email: c.email, name: c.name })));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative bg-white border-4 border-navy p-6 md:p-10 shadow-[8px_8px_0_0_#1E3A8A] ${className}`}>
      {/* Corner Decorations */}
      <div className="absolute top-2 right-2 flex gap-1">
        <div className="w-3 h-3 bg-retro-pink border-2 border-navy" />
        <div className="w-3 h-3 bg-retro-yellow border-2 border-navy" />
      </div>
      <div className="absolute bottom-2 left-2 flex gap-1">
        <div className="w-3 h-3 bg-retro-sky border-2 border-navy" />
        <div className="w-3 h-3 bg-retro-mint border-2 border-navy" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white p-4 border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]"
            >
              <Heart className="w-12 h-12 text-retro-pink fill-retro-pink" />
            </motion.div>
          </div>
          <h2 className="text-3xl md:text-4xl font-pixel text-navy mb-4 tracking-tighter">
            CRUSH LIST 💕
          </h2>
          <div className="bg-retro-yellow/20 border-2 border-dashed border-navy/30 p-4 mb-4">
            <p className="font-body text-navy text-sm md:text-base leading-relaxed">
              Optionally list up to <span className="font-pixel text-xs bg-retro-yellow px-2 py-0.5">{maxCrushes}</span> people you have a crush on.
              If they list you too, you'll both get a bonus!
            </p>
          </div>
          <p className="font-pixel text-[10px] text-navy/60 uppercase">
            Their email won't be revealed unless it's a mutual match.
          </p>
        </div>

        {/* Add new crush form */}
        <div className="bg-retro-cream border-4 border-navy p-6 mb-8 shadow-[4px_4px_0_0_#1E3A8A]">
          <h3 className="font-pixel text-xs text-navy mb-4 border-b-2 border-navy/10 pb-2">
            {'>>'} ADD A NEW CRUSH
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-pixel text-[10px] text-navy uppercase mb-2">
                Google Email <span className="text-cardinal-red">*</span>
              </label>
              <input
                type="email"
                placeholder="crush@example.com"
                value={newCrushEmail}
                onChange={(e) => {
                  setNewCrushEmail(e.target.value);
                  setEmailError('');
                }}
                className={`w-full bg-white border-4 border-navy p-3 font-body text-navy focus:outline-none focus:bg-retro-cream transition-colors ${emailError ? 'border-cardinal-red' : 'focus:border-retro-pink'
                  }`}
              />
              {emailError && <p className="text-cardinal-red font-pixel text-[10px] mt-2 italic">{emailError}</p>}
            </div>
            <div>
              <label className="block font-pixel text-[10px] text-navy uppercase mb-2">
                Their Name <span className="text-navy/40">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={newCrushName}
                onChange={(e) => setNewCrushName(e.target.value)}
                className="w-full bg-white border-4 border-navy p-3 font-body text-navy focus:outline-none focus:bg-retro-cream focus:border-retro-sky transition-colors"
              />
            </div>

            <button
              onClick={handleAddCrush}
              disabled={!newCrushEmail}
              className={`w-full font-pixel text-xs py-4 border-4 border-navy transition-all flex items-center justify-center gap-2 ${newCrushEmail
                ? 'bg-retro-pink text-white shadow-[4px_4px_0_0_#1E3A8A] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                : 'bg-navy/10 text-navy/30 cursor-not-allowed'
                }`}
            >
              <Plus className="w-4 h-4" />
              ADD TO LIST
            </button>
          </div>
        </div>

        {/* Crush list */}
        {crushes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-pixel text-xs text-navy">
                ENROLLED CRUSHES ({crushes.length}/{maxCrushes})
              </h3>
            </div>
            <div className="space-y-4">
              {crushes.map((crush) => (
                <div
                  key={crush.email}
                  className="group relative flex items-center justify-between p-4 bg-white border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] hover:bg-retro-cream transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 border-2 border-navy ${crush.isMutual ? 'bg-retro-pink' : 'bg-white'}`}>
                      <Heart className={`w-5 h-5 ${crush.isMutual ? 'text-white' : 'text-navy/20'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-xs text-navy truncate uppercase tracking-tight">
                        {crush.name || crush.email.split('@')[0]}
                      </p>
                      <p className="font-body text-xs text-navy/60 truncate">{crush.email}</p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {crush.isRegistered && (
                          <span className="font-pixel text-[8px] bg-retro-mint border-2 border-navy px-2 py-0.5 text-navy">
                            REGISTERED
                          </span>
                        )}
                        {crush.isMutual && (
                          <span className="font-pixel text-[8px] bg-retro-pink border-2 border-navy px-2 py-0.5 text-white animate-pulse">
                            MUTUAL!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCrush(crush.email)}
                    className="p-2 border-2 border-transparent hover:border-cardinal-red hover:bg-retro-pink/10 transition-all"
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5 text-cardinal-red" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Section */}
        <div className="pt-6 border-t-4 border-navy/10">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (crushes.length === 0 && existingCrushes.length === 0)}
            className={`w-full font-pixel text-sm py-6 border-4 border-navy transition-all shadow-[6px_6px_0_0_#1E3A8A] flex items-center justify-center gap-3 ${isSubmitting || (crushes.length === 0 && existingCrushes.length === 0)
              ? 'bg-navy/10 text-navy/30 cursor-not-allowed shadow-none translate-x-1 translate-y-1'
              : 'bg-navy text-white hover:bg-cardinal-red hover:shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-0.5 hover:translate-y-0.5'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                SAVING...
              </div>
            ) : crushes.length > 0 ? (
              <>
                <CheckCircle className="w-5 h-5" />
                SAVE CRUSH LIST
              </>
            ) : (
              'SKIP FOR NOW'
            )}
          </button>

          <div className="mt-6 p-4 bg-navy text-white font-pixel text-[9px] text-center uppercase tracking-widest leading-relaxed">
            Deadline: February 10, 11:59 PM
            <br />
            Updates are allowed until then!
          </div>
        </div>
      </div>
    </div>
  );

}
