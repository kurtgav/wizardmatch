'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Heart, CheckCircle } from 'lucide-react';

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
  const [crushes, setCrushes] = useState<Crush[]>(existingCrushes);
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
    <Card className={`p-6 md:p-8 ${className}`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-pink-100 p-4 rounded-full">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Crush List 💕</h2>
          <p className="text-gray-600">
            Optionally list up to {maxCrushes} people you have a crush on. If they list you too, you'll both get a bonus!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Their email won't be revealed unless it's a mutual match.
          </p>
        </div>

        {/* Add new crush form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold mb-4">Add a Crush</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Their Google Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="crush@example.com"
                value={newCrushEmail}
                onChange={(e) => {
                  setNewCrushEmail(e.target.value);
                  setEmailError('');
                }}
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Their Name <span className="text-gray-400">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="Jane Doe"
                value={newCrushName}
                onChange={(e) => setNewCrushName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddCrush}
              className="w-full bg-pink-500 hover:bg-pink-600"
              disabled={!newCrushEmail}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to List
            </Button>
          </div>
        </div>

        {/* Crush list */}
        {crushes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Crush List ({crushes.length}/{maxCrushes})</h3>
            </div>
            <div className="space-y-3">
              {crushes.map((crush) => (
                <div
                  key={crush.email}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {crush.isMutual && (
                      <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{crush.name || crush.email.split('@')[0]}</p>
                      <p className="text-sm text-gray-500">{crush.email}</p>
                      {crush.isRegistered && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
                          Registered
                        </span>
                      )}
                      {crush.isMutual && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full mt-1 ml-1 inline-block">
                          Mutual! 💕
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCrush(crush.email)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || crushes.length === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-6"
          size="lg"
        >
          {isSubmitting ? 'Saving...' : crushes.length > 0 ? 'Save Crush List' : 'Skip for Now'}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You can update your crush list until February 10, 11:59 PM
        </p>
      </div>
    </Card>
  );
}
