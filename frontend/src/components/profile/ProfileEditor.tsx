'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Save, Eye, EyeOff, X, Check, Loader2, User, FileText, Globe, Phone, Instagram, Facebook, GraduationCap, BookOpen, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileEditorProps {
  profile: {
    username?: string;
    bio?: string;
    profilePhotoUrl?: string;
    instagramHandle?: string;
    facebookProfile?: string;
    program?: string;
    yearLevel?: number;
    phoneNumber?: string;
    contactPreference?: 'Instagram' | 'Facebook' | 'Phone';
    profileVisibility?: 'Public' | 'Matches Only' | 'Private';
    gender?: string;
    seekingGender?: string;
  };
  onSave: (data: {
    username?: string;
    bio?: string;
    profilePhotoUrl?: string;
    instagramHandle?: string;
    facebookProfile?: string;
    program?: string;
    yearLevel?: number;
    phoneNumber?: string;
    contactPreference?: 'Instagram' | 'Facebook' | 'Phone';
    profileVisibility?: 'Public' | 'Matches Only' | 'Private';
    gender?: string;
    seekingGender?: string;
  }) => Promise<void>;
  isReadOnly?: boolean;
  className?: string;
}

export function ProfileEditor({
  profile,
  onSave,
  isReadOnly = false,
  className = '',
}: ProfileEditorProps) {
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profilePhotoUrl || '');
  const [instagramHandle, setInstagramHandle] = useState(profile.instagramHandle || '');
  const [facebookProfile, setFacebookProfile] = useState(profile.facebookProfile || '');
  const [program, setProgram] = useState(profile.program || '');
  const [yearLevel, setYearLevel] = useState<number>(profile.yearLevel || 1);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || '');
  const [contactPreference, setContactPreference] = useState<'Instagram' | 'Facebook' | 'Phone'>(
    (profile.contactPreference as any) === 'Email' ? 'Instagram' : profile.contactPreference || 'Instagram'
  );
  const [profileVisibility, setProfileVisibility] = useState<'Public' | 'Matches Only' | 'Private'>(
    profile.profileVisibility || 'Matches Only'
  );
  const [gender, setGender] = useState(profile.gender || '');
  const [seekingGender, setSeekingGender] = useState(profile.seekingGender || '');

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasChanges(
      username !== (profile.username || '') ||
      bio !== (profile.bio || '') ||
      profilePhotoUrl !== (profile.profilePhotoUrl || '') ||
      instagramHandle !== (profile.instagramHandle || '') ||
      facebookProfile !== (profile.facebookProfile || '') ||
      program !== (profile.program || '') ||
      yearLevel !== (profile.yearLevel || 1) ||
      phoneNumber !== (profile.phoneNumber || '') ||
      contactPreference !== (profile.contactPreference || 'Instagram') ||
      profileVisibility !== (profile.profileVisibility || 'Matches Only') ||
      gender !== (profile.gender || '') ||
      seekingGender !== (profile.seekingGender || '')
    );
  }, [username, bio, profilePhotoUrl, instagramHandle, facebookProfile, program, yearLevel, phoneNumber, contactPreference, profileVisibility, profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size too large. Please select an image under 2MB.');
      return;
    }

    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoUrl(reader.result as string);
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave({
        username,
        bio,
        profilePhotoUrl,
        instagramHandle,
        facebookProfile,
        program,
        yearLevel,
        phoneNumber,
        contactPreference,
        profileVisibility,
        gender,
        seekingGender,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isReadOnly) {
    return (
      <div className={`relative bg-white border-4 border-navy p-6 md:p-8 shadow-[8px_8px_0_0_#1E3A8A] ${className}`}>
        {/* Corner Decorations */}
        <div className="absolute top-2 right-2 w-4 h-4 bg-retro-pink border-2 border-navy" />
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-retro-yellow border-2 border-navy" />

        <div className="flex items-center gap-6 mb-10 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-navy overflow-hidden bg-retro-cream shadow-[4px_4px_0_0_#1E3A8A]">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-navy/20" />
                </div>
              )}
            </div>
            {/* Pixel badge for read-only */}
            <div className="absolute -bottom-2 -right-2 bg-retro-yellow border-2 border-navy px-2 py-0.5">
              <p className="font-pixel text-[8px] text-navy">LEVEL {profile.yearLevel || 1}</p>
            </div>
          </div>
          <div>
            <h2 className="font-pixel text-xl text-navy mb-1 uppercase tracking-tight">
              {profile.username || 'Mysterious Wizard'}
            </h2>
            <div className="flex flex-col gap-1">
              {profile.instagramHandle && (
                <div className="inline-flex items-center gap-2 bg-retro-sky/10 border-2 border-dashed border-navy/20 px-3 py-1">
                  <Instagram className="w-3 h-3 text-navy/40" />
                  <p className="font-body text-xs text-navy/60">@{profile.instagramHandle}</p>
                </div>
              )}
              {profile.program && (
                <div className="inline-flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 text-navy/40" />
                  <p className="font-body text-xs text-navy/60">{profile.program}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          {profile.bio && (
            <div className="bg-retro-cream border-2 border-navy p-4">
              <h3 className="font-pixel text-[10px] text-navy/40 uppercase mb-3">{'>>'} CHARACTER BIO</h3>
              <p className="font-body text-sm text-navy leading-relaxed italic">"{profile.bio}"</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]">
              <p className="font-pixel text-[8px] text-navy/40 uppercase mb-1">CONTACT VIA</p>
              <p className="font-pixel text-xs text-navy uppercase">{profile.contactPreference}</p>
            </div>
            <div className="p-4 bg-white border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A]">
              <p className="font-pixel text-[8px] text-navy/40 uppercase mb-1">VISIBILITY</p>
              <p className="font-pixel text-xs text-navy uppercase">{profile.profileVisibility}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block bg-retro-yellow border-4 border-navy px-6 py-2 shadow-[6px_6px_0_0_#1E3A8A] mb-4"
        >
          <p className="font-pixel text-xs text-navy uppercase tracking-widest">
            CHARACTER CUSTOMIZATION
          </p>
        </motion.div>
        <h2 className="font-pixel text-3xl md:text-5xl text-navy tracking-tighter">
          REFINE YOUR <span className="text-cardinal-red">WIZARD</span>
        </h2>
        <p className="font-body text-navy/60 max-w-md mx-auto italic">
          Your profile is your magical signature. Make it represent the real you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar: Photo & Visibility */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
            <div className="flex flex-col items-center">
              <label className="font-pixel text-[10px] text-navy/40 uppercase mb-6 tracking-widest">AVATAR PREVIEW</label>

              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-44 h-44 border-8 border-navy overflow-hidden relative bg-retro-cream shadow-[8px_8px_0_0_#1E3A8A]"
                >
                  {photoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <div className="w-8 h-8 border-4 border-retro-pink border-t-transparent animate-spin" />
                    </div>
                  ) : profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-navy/10">
                      <Camera className="w-16 h-16 mb-2" />
                      <span className="font-pixel text-[8px]">EMPTY_SLOT</span>
                    </div>
                  )}
                </motion.div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-4 -right-4 bg-retro-pink text-white p-4 border-4 border-navy shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Camera className="w-6 h-6" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="mt-10 p-3 bg-retro-cream/50 border-2 border-dashed border-navy/20 w-full text-center">
                <p className="font-pixel text-[8px] text-navy/40 uppercase">
                  JPG/PNG/GIF {'<'} 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-navy p-6 shadow-[6px_6px_0_0_#1E3A8A]">
            <label className="font-pixel text-[10px] text-navy/40 uppercase mb-6 block tracking-widest">PRIVACY SETTINGS</label>
            <div className="space-y-4">
              {[
                { value: 'Matches Only', icon: Eye, label: 'MATCHES ONLY', desc: 'Visible after match' },
                { value: 'Public', icon: Globe, label: 'PUBLIC', desc: 'Visible to everyone' },
                { value: 'Private', icon: EyeOff, label: 'PRIVATE', desc: 'Hidden from all' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setProfileVisibility(opt.value as any)}
                  className={`w-full flex items-center gap-4 p-4 border-4 transition-all ${profileVisibility === opt.value
                    ? 'border-navy bg-retro-sky text-navy shadow-[4px_4px_0_0_#1E3A8A]'
                    : 'border-transparent hover:border-navy/20 hover:bg-retro-cream text-navy/60'
                    }`}
                >
                  <opt.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-pixel text-[10px] uppercase truncate">{opt.label}</p>
                    <p className="font-body text-[10px] opacity-60 truncate">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Info & Ethics */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-4 border-navy p-8 shadow-[8px_8px_0_0_#1E3A8A]">
            <div className="space-y-8">
              {/* Username */}
              <div className="space-y-3">
                <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3 text-retro-pink" /> USERNAME
                </label>
                <input
                  placeholder="E.g. StarGazer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-retro-pink transition-colors"
                />
              </div>

              {/* Identity & Matching */}
              <div>
                <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2 mb-4 p-2 bg-retro-pink/20">
                  <Heart className="w-3 h-3 text-navy" /> MATCHING PREFERENCES
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest">
                      I AM
                    </label>
                    <div className="relative">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-navy transition-colors appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                      </select>
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest">
                      LOOKING FOR
                    </label>
                    <div className="relative">
                      <select
                        value={seekingGender}
                        onChange={(e) => setSeekingGender(e.target.value)}
                        className="w-full bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-navy transition-colors appearance-none"
                      >
                        <option value="">Select Preference</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Any">Any</option>
                      </select>
                      <Heart className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2 mb-4 p-2 bg-retro-yellow/20">
                  <GraduationCap className="w-3 h-3 text-navy" /> ACADEMIC INFORMATION
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest">
                      PROGRAM
                    </label>
                    <input
                      placeholder="E.g. Computer Science"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-navy transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest">
                      YEAR LEVEL
                    </label>
                    <div className="relative">
                      <select
                        value={yearLevel}
                        onChange={(e) => setYearLevel(Number(e.target.value))}
                        className="w-full bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-navy transition-colors appearance-none"
                      >
                        {[1, 2, 3, 4, 5].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                      <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2 mb-4 p-2 bg-retro-sky/20">
                  <Globe className="w-3 h-3 text-navy" /> SOCIAL MEDIA
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2">
                      <Instagram className="w-3 h-3 text-retro-sky" /> INSTAGRAM
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-pixel text-navy/40">@</span>
                      <input
                        placeholder="username"
                        value={instagramHandle?.replace('@', '')}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        className="w-full bg-retro-cream border-4 border-navy pl-10 p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-retro-sky transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2">
                      <Facebook className="w-3 h-3 text-blue-600" /> FACEBOOK
                    </label>
                    <div className="relative">
                      <input
                        placeholder="Profile Link / Name"
                        value={facebookProfile}
                        onChange={(e) => setFacebookProfile(e.target.value)}
                        className="w-full bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3 text-retro-yellow" /> CHARACTER BIO
                  </label>
                  <span className="font-pixel text-[8px] text-navy/20">{bio.length}/500</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Share your interests, hobbies, or what makes you unique..."
                  className="w-full min-h-[160px] bg-retro-cream border-4 border-navy p-4 font-body text-navy focus:outline-none focus:bg-white focus:border-retro-yellow transition-colors resize-none"
                />
              </div>

              {/* Contact Method */}
              <div className="space-y-6 pt-6 border-t-4 border-navy/5">
                <label className="font-pixel text-[10px] text-navy/40 uppercase tracking-widest">PREFERRED CONTACT</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: 'Instagram', icon: Instagram, label: 'INSTAGRAM' },
                    { value: 'Facebook', icon: Facebook, label: 'FACEBOOK' },
                    { value: 'Phone', icon: Phone, label: 'PHONE CALL' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setContactPreference(method.value as any)}
                      className={`flex items-center gap-3 px-6 py-4 border-4 transition-all font-pixel text-[10px] ${contactPreference === method.value
                        ? 'border-navy bg-navy text-white shadow-[4px_4px_0_0_#1E3A8A]'
                        : 'border-navy/10 bg-retro-cream text-navy/40 hover:border-navy/40'
                        }`}
                    >
                      <method.icon className="w-4 h-4" />
                      {method.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {contactPreference === 'Phone' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-retro-cream border-4 border-navy border-dashed mt-2">
                        <label className="font-pixel text-[10px] text-navy/40 uppercase mb-3 block">PHONE NUMBER</label>
                        <input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-white border-4 border-navy p-4 font-body text-navy focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col md:flex-row items-stretch gap-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`flex-1 font-pixel text-sm py-8 border-4 border-navy transition-all shadow-[8px_8px_0_0_#1E3A8A] flex items-center justify-center gap-4 ${hasChanges && !isSaving
                ? 'bg-retro-pink text-white hover:bg-cardinal-red hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                : 'bg-navy/10 text-navy/30 cursor-not-allowed shadow-none translate-x-1 translate-y-1'
                }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  UPDATE PROFILE
                </>
              )}
            </button>

            {hasChanges && !isSaving && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => {
                  setUsername(profile.username || '');
                  setBio(profile.bio || '');
                  setProfilePhotoUrl(profile.profilePhotoUrl || '');
                  setInstagramHandle(profile.instagramHandle || '');
                  setFacebookProfile(profile.facebookProfile || '');
                  setProgram(profile.program || '');
                  setYearLevel(profile.yearLevel || 1);
                  setPhoneNumber(profile.phoneNumber || '');
                  setContactPreference((profile.contactPreference as any) === 'Email' ? 'Instagram' : profile.contactPreference || 'Instagram');
                  setProfileVisibility(profile.profileVisibility || 'Matches Only');
                  setGender(profile.gender || '');
                  setSeekingGender(profile.seekingGender || '');
                }}
                className="p-8 border-4 border-navy text-navy/40 hover:bg-retro-cream transition-colors shadow-[4px_4px_0_0_#1E3A8A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                title="Discard changes"
              >
                <X className="w-6 h-6" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
