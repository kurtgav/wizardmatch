'use client';

import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: {
    id: string;
    questionText: string;
    questionType: string;
    options: string[] | null;
  };
  answer: any;
  onAnswer: (answer: any) => void;
}

export default function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="card-retro"
    >
      <h2 className="font-pixel text-base md:text-lg text-navy mb-8 leading-relaxed">
        {question.questionText}
      </h2>

      {question.questionType === 'multiple_choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onAnswer(option)}
              className={`w-full text-left p-4 border-4 transition-all font-body font-semibold text-base relative ${
                answer === option
                  ? 'bg-retro-pink border-cardinal-red text-navy shadow-[4px_4px_0_0_#1E3A8A]'
                  : 'bg-white border-retro-sky text-navy hover:border-retro-plum hover:shadow-[4px_4px_0_0_#E6E6FA]'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      )}

      {question.questionType === 'scale' && (
        <div className="space-y-6">
          <div className="flex justify-between text-xs font-pixel text-navy/60">
            <span>STRONGLY DISAGREE</span>
            <span>STRONGLY AGREE</span>
          </div>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAnswer(value)}
                className={`flex-1 aspect-square border-4 font-pixel text-sm transition-all ${
                  answer === value
                    ? 'bg-retro-sky border-navy text-white shadow-[4px_4px_0_0_#1E3A8A]'
                    : 'bg-white border-retro-sky text-navy hover:border-retro-plum hover:shadow-[3px_3px_0_0_#E6E6FA]'
                }`}
              >
                {value}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {question.questionType === 'text' && (
        <div>
          <textarea
            value={answer || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border-4 border-retro-sky font-body text-base focus:border-retro-plum focus:outline-none focus:shadow-[4px_4px_0_0_#E6E6FA] transition-all resize-none bg-white"
            rows={4}
          />
        </div>
      )}
    </motion.div>
  );
}
