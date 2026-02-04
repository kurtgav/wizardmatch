'use client';

import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: {
    id: string;
    questionText: string;
    questionType: string;
    options: any;
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
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white border-8 border-navy shadow-[12px_12px_0_0_#1E3A8A] p-6 md:p-10 relative overflow-hidden"
    >
      {/* Corner Pixel Decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-retro-pink border-b-4 border-l-4 border-navy translate-x-1 -translate-y-1" />

      <h2 className="font-display font-black text-xl md:text-2xl text-navy mb-10 leading-snug relative z-10">
        {question.questionText}
      </h2>

      <div className="relative z-10">
        {question.questionType === 'multiple_choice' && Array.isArray(question.options) && (
          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01, x: 3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                onClick={() => onAnswer(option)}
                className={`w-full text-left p-5 border-4 transition-all font-display font-bold text-lg relative group ${answer === option
                  ? 'bg-retro-pink border-navy text-navy shadow-[6px_6px_0_0_#1E3A8A]'
                  : 'bg-white border-navy/20 text-navy/80 hover:border-navy hover:bg-retro-cream hover:text-navy hover:shadow-[4px_4px_0_0_#1E3A8A]'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 border-2 border-navy flex items-center justify-center shrink-0 ${answer === option ? 'bg-retro-yellow' : 'bg-transparent'}`}>
                    {answer === option && <div className="w-2 h-2 bg-navy" />}
                  </div>
                  {option}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {question.questionType === 'scale' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center px-2">
              <span className="font-pixel text-[10px] text-navy/40 uppercase max-w-[100px]">
                {question.options?.labels?.['1'] || 'Disagree'}
              </span>
              <span className="font-pixel text-[10px] text-navy/40 uppercase max-w-[100px] text-right">
                {question.options?.labels?.[question.options?.max?.toString()] || 'Agree'}
              </span>
            </div>

            <div className="flex flex-wrap justify-between gap-2 md:gap-4">
              {Array.from({ length: question.options?.max || 10 }, (_, i) => i + (question.options?.min || 1)).map((value) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.08, y: -3, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                  onClick={() => onAnswer(value)}
                  className={`flex-1 min-w-[40px] aspect-square border-4 font-display font-black text-xl flex items-center justify-center transition-all ${answer === value
                    ? 'bg-retro-sky border-navy text-navy shadow-[6px_6px_0_0_#1E3A8A]'
                    : 'bg-white border-navy/10 text-navy/40 hover:border-navy hover:text-navy hover:shadow-[4px_4px_0_0_#1E3A8A]'
                    }`}
                >
                  {value}
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <span className="font-pixel text-[11px] text-retro-pink">
                {answer ? `SELECTED LEVEL: ${answer}` : 'TAP A LEVEL TO SELECT'}
              </span>
            </div>
          </div>
        )}

        {question.questionType === 'text' && (
          <div className="relative">
            <div className="absolute -inset-1 bg-navy translate-x-2 translate-y-2 opacity-10" />
            <textarea
              value={answer || ''}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="CAST YOUR SPELL HERE..."
              className="w-full p-6 border-4 border-navy font-body text-lg focus:outline-none focus:bg-retro-cream transition-all resize-none bg-white relative z-10"
              rows={4}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
