'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { api } from '@/lib/api';
import ProgressBar from '@/components/survey/ProgressBar';
import QuestionCard from '@/components/survey/QuestionCard';
import { ChevronLeft, ChevronRight, Flower2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Question {
  id: string;
  category: string;
  questionText: string;
  questionType: string;
  options: any;
  orderIndex: number;
}

interface GroupedQuestions {
  [category: string]: Question[];
}

export default function SurveyPage() {
  const { user, loading: authLoading } = useAuthState();
  const router = useRouter();
  const [questions, setQuestions] = useState<GroupedQuestions>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const answersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user?.surveyCompleted) {
      router.push('/matches');
      return;
    }

    loadQuestions();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  async function loadQuestions() {
    try {
      console.log('Fetching questions...');
      const response = await api.getQuestions();
      if (response.success) {
        setQuestions(response.data);
        const cats = Object.keys(response.data);
        setCategories(cats);
        console.log(`Loaded ${cats.length} categories.`);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProgress() {
    try {
      const response = await api.getProgress();
      if (response.success) {
        setProgress(response.data.percentage);

        // Load existing answers
        const responsesResponse = await api.getResponses();
        if (responsesResponse.success) {
          const savedAnswers: Record<string, any> = {};
          responsesResponse.data.forEach((r: any) => {
            savedAnswers[r.questionId] = r.answerValue !== null ? r.answerValue : r.answerText;
          });
          setAnswers(savedAnswers);
          answersRef.current = savedAnswers;
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  async function handleAnswer(answer: any) {
    const currentCategory = categories[currentCategoryIndex];
    if (!currentCategory) return;

    const currentQuestions = questions[currentCategory];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Update local state immediately
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    answersRef.current = newAnswers;

    // Update progress
    const allQuestions = Object.values(questions).flat();
    const totalQuestions = allQuestions.length;
    const answeredQuestions = Object.keys(newAnswers).length;
    const newProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    setProgress(newProgress);

    // Save to database
    setSaveStatus('saving');
    try {
      const submissionData = {
        questionId: currentQuestion.id,
        answerText: typeof answer === 'string' ? answer : undefined,
        answerValue: typeof answer === 'number' ? answer : undefined,
        answerType: currentQuestion.questionType as any,
      };

      await api.submitResponse(submissionData);
      setSaveStatus('saved');
      // No delay for idle reset if it's too distracting, or shorter
      setTimeout(() => setSaveStatus('idle'), 1000);
    } catch (error: any) {
      console.error('Failed to save answer:', error);
      setSaveStatus('error');
    }
  }

  async function handleNext() {
    const currentCategory = categories[currentCategoryIndex];
    const currentQuestions = questions[currentCategory];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    if (currentAnswer === undefined || currentAnswer === null) {
      return; // Shouldn't happen as button is disabled
    }

    const allQuestions = Object.values(questions).flat();
    const totalQuestionsCount = allQuestions.length;

    // Calculate current global index
    let questionNumber = 0;
    for (let i = 0; i < currentCategoryIndex; i++) {
      questionNumber += questions[categories[i]].length;
    }
    questionNumber += currentQuestionIndex + 1;

    // If it's the last question, complete.
    if (questionNumber === totalQuestionsCount) {
      setSubmitting(true);
      try {
        console.log('Finishing survey...');
        // Final save just in case
        await handleAnswer(currentAnswer);

        const res = await api.completeSurvey() as { success: boolean, message?: string };
        if (res.success) {
          // Redirect to profile edit page after survey completion
          router.push('/profile/edit');
        } else {
          throw new Error(res.message || 'Completion failed');
        }
      } catch (error: any) {
        console.error('Survey completion error:', error);
        alert(error.message || 'Something went wrong. Please check your internet and try again.');
        setSubmitting(false);
      }
      return;
    }

    // Go to next question
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    }

    // Jump to top of page on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentCategoryIndex > 0) {
      const prevCatIndex = currentCategoryIndex - 1;
      const prevCatQuestions = questions[categories[prevCatIndex]];
      setCurrentCategoryIndex(prevCatIndex);
      setCurrentQuestionIndex(prevCatQuestions.length - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-navy animate-spin" />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-retro-cream">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="font-pixel text-lg text-navy mb-4">WIZARDS ARE PREPARING THE QUESTIONS...</p>
          <Loader2 className="w-8 h-8 text-retro-pink animate-spin" />
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = questions[currentCategory];
  const currentQuestion = currentQuestions ? currentQuestions[currentQuestionIndex] : null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  if (!currentQuestion) {
    return <div>Error loading question.</div>;
  }

  let overallQuestionNumber = 0;
  for (let i = 0; i < currentCategoryIndex; i++) {
    overallQuestionNumber += questions[categories[i]].length;
  }
  overallQuestionNumber += currentQuestionIndex + 1;
  const totalQuestions = Object.values(questions).flat().length;

  return (
    <div className="min-h-screen bg-retro-cream">
      <Header />

      <main className="pt-24 md:pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-2xl relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy p-6 border-4 border-navy shadow-[8px_8px_0_0_#E52037] mb-8 text-center"
          >
            <h1 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
              Compatibility Chamber
            </h1>
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="h-[2px] w-8 bg-retro-yellow" />
              <span className="font-pixel text-[10px] text-retro-yellow uppercase">Question {overallQuestionNumber} of {totalQuestions}</span>
              <div className="h-[2px] w-8 bg-retro-yellow" />
            </div>
          </motion.div>

          <ProgressBar progress={progress} />

          {/* Category Hub */}
          <div className="flex justify-center mb-8">
            <div className="bg-white border-4 border-navy px-4 py-1 flex items-center gap-2 shadow-[4px_4px_0_0_#1E3A8A]">
              <Flower2 className="w-3 h-3 text-retro-plum" />
              <span className="font-pixel text-[10px] uppercase text-navy">{currentCategory}</span>
              <Flower2 className="w-3 h-3 text-retro-plum" />
            </div>
          </div>

          {/* Question Stage */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <QuestionCard
                question={currentQuestion}
                answer={currentAnswer}
                onAnswer={handleAnswer}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0 || submitting}
              className="w-full md:w-auto font-pixel text-xs border-4 border-navy h-14 px-8 shadow-[4px_4px_0_0_#1E3A8A] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>

            <div className="hidden md:block flex-1 flex justify-center">
              {saveStatus === 'saving' && <span className="font-pixel text-[8px] text-navy/40 animate-pulse">PLANTING SEEDS...</span>}
              {saveStatus === 'saved' && <span className="font-pixel text-[8px] text-retro-mint">GARDEN SYNCED!</span>}
              {saveStatus === 'error' && <span className="font-pixel text-[8px] text-cardinal-red" title="Check console for details">SYNC FAILED! RETRYING...</span>}
            </div>

            <Button
              onClick={handleNext}
              disabled={!currentAnswer || submitting}
              className={`w-full md:w-auto font-pixel text-xs text-navy border-4 border-navy h-14 px-10 shadow-[6px_6px_0_0_#1E3A8A] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all ${overallQuestionNumber === totalQuestions ? 'bg-retro-yellow' : 'bg-retro-sky'
                }`}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  FINISHING...
                </div>
              ) : overallQuestionNumber === totalQuestions ? (
                <div className="flex items-center gap-2">
                  COMPLETE <Flower2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  NEXT <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          <p className="mt-8 text-center font-pixel text-[9px] text-navy/30 uppercase tracking-[0.2em]">
            Progress is automatically locked into the crystal ball
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
