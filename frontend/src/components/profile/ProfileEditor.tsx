'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Save, Eye, EyeOff } from 'lucide-react';

interface ProfileEditorProps {
  profile: {
    bio?: string;
    profilePhotoUrl?: string;
    instagramHandle?: string;
    phoneNumber?: string;
    contactPreference?: 'Instagram' | 'Phone' | 'Email';
    profileVisibility?: 'Public' | 'Matches Only' | 'Private';
  };
  onSave: (data: {
    bio?: string;
    profilePhotoUrl?: string;
    instagramHandle?: string;
    phoneNumber?: string;
    contactPreference?: 'Instagram' | 'Phone' | 'Email';
    profileVisibility?: 'Public' | 'Matches Only' | 'Private';
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
  const [bio, setBio] = useState(profile.bio || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile.profilePhotoUrl || '');
  const [instagramHandle, setInstagramHandle] = useState(profile.instagramHandle || '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || '');
  const [contactPreference, setContactPreference] = useState<'Instagram' | 'Phone' | 'Email'>(
    profile.contactPreference || 'Instagram'
  );
  const [profileVisibility, setProfileVisibility] = useState<'Public' | 'Matches Only' | 'Private'>(
    profile.profileVisibility || 'Matches Only'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(
      bio !== (profile.bio || '') ||
      profilePhotoUrl !== (profile.profilePhotoUrl || '') ||
      instagramHandle !== (profile.instagramHandle || '') ||
      phoneNumber !== (profile.phoneNumber || '') ||
      contactPreference !== (profile.contactPreference || 'Instagram') ||
      profileVisibility !== (profile.profileVisibility || 'Matches Only')
    );
  }, [bio, profilePhotoUrl, instagramHandle, phoneNumber, contactPreference, profileVisibility, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        bio: bio || undefined,
        profilePhotoUrl: profilePhotoUrl || undefined,
        instagramHandle: instagramHandle || undefined,
        phoneNumber: phoneNumber || undefined,
        contactPreference,
        profileVisibility,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isReadOnly) {
    return (
      <Card className={`p-6 ${className}`}>
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
        <div className="space-y-4">
          {profile.profilePhotoUrl && (
            <div>
              <label className="block text-sm font-medium mb-2">Profile Photo</label>
              <img src={profile.profilePhotoUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
            </div>
          )}
          {profile.bio && (
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
          <div className="text-sm text-gray-500">
            <p>Contact Preference: {profile.contactPreference || 'Not set'}</p>
            <p>Visibility: {profile.profileVisibility || 'Matches Only'}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 md:p-8 ${className}`}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Polish Your Profile ✨</h2>
          <p className="text-gray-600">
            Update your profile before matches see it. Make a great first impression!
          </p>
        </div>

        {/* Profile Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Profile Photo URL</label>
          <div className="flex items-center gap-4">
            <Input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              className="flex-1"
            />
            {profilePhotoUrl && (
              <img
                src={profilePhotoUrl}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border"
                onError={() => setProfilePhotoUrl('')}
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a URL to your photo. Use a clear, friendly photo!
          </p>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Bio <span className="text-gray-400">(max 500 characters)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            placeholder="Tell your matches a bit about yourself..."
            className="w-full px-3 py-2 border rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-pink-500"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Share your interests, hobbies, what you're looking for...
            </p>
            <span className="text-xs text-gray-400">{bio.length}/500</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose how you want your matches to contact you. Only share what you're comfortable with.
          </p>

          {/* Contact Preference */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Preferred Contact Method</label>
            <div className="flex gap-4">
              {(['Instagram', 'Phone', 'Email'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setContactPreference(method)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    contactPreference === method
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Instagram */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Instagram Handle</label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">@</span>
              <Input
                type="text"
                placeholder="username"
                value={instagramHandle?.replace('@', '')}
                onChange={(e) => setInstagramHandle(e.target.value)}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <Input
              type="tel"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Profile Visibility */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Profile Visibility</label>
          <div className="space-y-2">
            {[
              { value: 'Matches Only', label: 'Matches Only', icon: Eye, desc: 'Only your matches can see your profile' },
              { value: 'Private', label: 'Private', icon: EyeOff, desc: 'Profile hidden from everyone' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setProfileVisibility(option.value as any)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  profileVisibility === option.value
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <option.icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-6"
          size="lg"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You can update your profile until February 13, 11:59 PM
        </p>
      </div>
    </Card>
  );
}
