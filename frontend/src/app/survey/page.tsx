'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { api } from '@/lib/api';
import ProgressBar from '@/components/survey/ProgressBar';
import QuestionCard from '@/components/survey/QuestionCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  category: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user?.surveyCompleted) {
      router.push('/matches');
      return;
    }

    // Load questions immediately (no auth required)
    loadQuestions();

    // Load progress and saved answers (requires auth)
    if (user) {
      loadProgress();
    }
  }, [user, authLoading, router]);

  async function loadQuestions() {
    try {
      const response = await api.getQuestions();
      if (response.success) {
        setQuestions(response.data);
        setCategories(Object.keys(response.data));
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
            savedAnswers[r.questionId] =
              r.answerValue !== null ? r.answerValue : r.answerText;
          });
          setAnswers(savedAnswers);
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      // Don't block the survey if progress fails to load
    }
  }

  async function handleAnswer(answer: any) {
    const currentCategory = categories[currentCategoryIndex];
    const currentQuestions = questions[currentCategory];
    const currentQuestion = currentQuestions[currentQuestionIndex];

    // Update local state immediately (optimistic update)
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Update progress (safe calculation)
    const allQuestions = Object.values(questions).flat();
    const totalQuestions = allQuestions.length;
    const answeredQuestions = Object.keys(newAnswers).length;
    const newProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    setProgress(newProgress);

    // Save to backend in background (don't block UI)
    api.submitResponse({
      questionId: currentQuestion.id,
      answerText: typeof answer === 'string' ? answer : undefined,
      answerValue: typeof answer === 'number' ? answer : undefined,
      answerType: currentQuestion.questionType,
    }).catch((error) => {
      // Silent retry once if failed
      setTimeout(() => {
        api.submitResponse({
          questionId: currentQuestion.id,
          answerText: typeof answer === 'string' ? answer : undefined,
          answerValue: typeof answer === 'number' ? answer : undefined,
          answerType: currentQuestion.questionType,
        }).catch((retryError) => {
          console.error('Failed to save answer after retry:', retryError);
        });
      }, 1000);
    });
  }

  async function handleNext() {
    const currentCategory = categories[currentCategoryIndex];
    const currentQuestions = questions[currentCategory];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    // Check if current question is answered
    if (!currentAnswer) {
      return;
    }

    // Small delay to ensure save initiated
    await new Promise(resolve => setTimeout(resolve, 200));

    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Last question - complete survey
      await handleComplete();
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      setCurrentQuestionIndex(questions[categories[currentCategoryIndex - 1]].length - 1);
    }
  }

  async function handleComplete() {
    setSubmitting(true);
    try {
      // Debug: log current state
      const allQuestions = Object.values(questions).flat();
      const totalQuestions = allQuestions.length;
      const answeredQuestions = Object.keys(answers).length;
      console.log(`Attempting to complete survey: ${answeredQuestions}/${totalQuestions} answered`);

      const response = await api.completeSurvey() as { success: boolean; message?: string };
      console.log('Complete survey response:', response);

      if (response.success) {
        router.push('/matches');
      } else {
        console.error('Survey completion failed:', response);
        alert(response.message || 'Failed to complete survey. Please try again.');
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error('Failed to complete survey:', error);

      // Check if it's because not all questions are answered
      const allQuestions = Object.values(questions).flat();
      const totalQuestions = allQuestions.length;
      const answeredQuestions = Object.keys(answers).length;

      console.log(`Questions answered: ${answeredQuestions}/${totalQuestions}`);

      if (answeredQuestions < totalQuestions) {
        alert(`Please answer all questions first. (${totalQuestions - answeredQuestions} remaining)`);
      } else {
        alert('Failed to complete survey. Please try again.');
      }
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-light">
        <div className="w-16 h-16 border-4 border-cardinal-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if questions are loaded and valid
  if (!categories || categories.length === 0 || Object.keys(questions).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-cream">
        <div className="text-center">
          <p className="font-pixel text-sm text-navy mb-4">Loading survey questions...</p>
          <div className="w-16 h-16 border-4 border-retro-sky border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = questions[currentCategory];

  // Additional safety check
  if (!currentCategory || !currentQuestions || currentQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-cream">
        <div className="text-center">
          <p className="font-pixel text-sm text-navy mb-4">No survey questions available.</p>
          <p className="font-body text-base text-navy/70">Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  // Calculate actual question number (not based on answered count)
  let questionsBeforeCurrent = 0;
  for (let i = 0; i < currentCategoryIndex; i++) {
    questionsBeforeCurrent += questions[categories[i]].length;
  }
  const overallQuestionNumber = questionsBeforeCurrent + currentQuestionIndex + 1;
  const totalQuestions = Object.values(questions).flat().length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-retro-cream py-24">
      {/* Pixel Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(#1E3A8A 1px, transparent 1px),
            linear-gradient(90deg, #1E3A8A 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-pixel text-xl md:text-2xl text-cardinal-red mb-2">
            COMPATIBILITY SURVEY
          </h1>
          <p className="font-body text-base text-navy">
            QUESTION {overallQuestionNumber} OF {totalQuestions}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <ProgressBar progress={progress} />

        {/* Category Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-retro-pink transform translate-x-1 translate-y-1"></div>
            <div className="relative bg-retro-sky border-4 border-navy px-6 py-2 transform -translate-x-0.5 -translate-y-0.5">
              <span className="font-pixel text-xs text-navy">
                {currentCategory}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mt-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            PREVIOUS
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!currentAnswer || submitting}
            className="gap-2"
          >
            {submitting ? (
              'SAVING...'
            ) : overallQuestionNumber === totalQuestions ? (
              <>
                SAVE
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                NEXT
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Save Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-pixel text-xs text-navy/60 text-center mt-6"
        >
          PROGRESS SAVED AUTOMATICALLY
        </motion.p>
      </div>
    </div>
  );
}
