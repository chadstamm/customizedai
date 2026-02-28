'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { AIGeneratedQuestion } from '@/types/wizard';

const MAX_ANSWER_LENGTH = 10000;

export function QuestionStep() {
  const {
    state,
    nextStep,
    prevStep,
    saveAnswer,
    getAnswer,
    generateInstructions,
  } = useWizard();

  // Local component state
  const [currentQuestion, setCurrentQuestion] = useState<AIGeneratedQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const questionNumberRef = useRef(questionNumber);

  // Keep ref in sync
  useEffect(() => {
    questionNumberRef.current = questionNumber;
  }, [questionNumber]);

  // Voice input integration
  const {
    isListening,
    isSupported: voiceSupported,
    interimTranscript,
    toggleListening,
    resetTranscript,
    error: voiceError,
  } = useVoiceInput({
    onTranscript: (newTranscript) => {
      setCurrentAnswer(prev => prev + (prev ? ' ' : '') + newTranscript.trim());
    },
  });

  // Build previous answers array from wizard state
  const buildPreviousAnswers = useCallback(() => {
    return state.answers.map(a => ({
      question: a.question,
      answer: a.answer,
    }));
  }, [state.answers]);

  // Fetch next question from API
  const fetchNextQuestion = useCallback(async () => {
    setIsLoadingQuestion(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedModels: state.selectedModels,
          writingCodex: state.writingCodex,
          personalConstitution: state.personalConstitution,
          previousAnswers: buildPreviousAnswers(),
          questionCount: questionNumberRef.current - 1,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        setFetchError(data.error || 'Failed to generate question');
        setIsLoadingQuestion(false);
        return;
      }

      const question: AIGeneratedQuestion = data.data;

      // If AI says we have enough answers, trigger generation
      if (question.isComplete) {
        generateInstructions();
        return;
      }

      setCurrentQuestion(question);
      setIsLoadingQuestion(false);

      // Restore existing answer if going back
      const existingAnswer = getAnswer(`q-${questionNumberRef.current}`);
      if (existingAnswer) {
        if (question.inputType === 'multiselect') {
          setMultiSelectAnswers(existingAnswer.answer.split(', ').filter(Boolean));
          setCurrentAnswer('');
        } else {
          setCurrentAnswer(existingAnswer.answer);
          setMultiSelectAnswers([]);
        }
      }
    } catch {
      setFetchError('Network error. Please check your connection and try again.');
      setIsLoadingQuestion(false);
    }
  }, [state.selectedModels, state.writingCodex, state.personalConstitution, buildPreviousAnswers, generateInstructions, getAnswer]);

  // Fetch question on mount and when questionNumber changes
  useEffect(() => {
    fetchNextQuestion();
  }, [questionNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus textarea when question loads
  useEffect(() => {
    if (!isLoadingQuestion && currentQuestion?.inputType !== 'multiselect' && textareaRef.current) {
      const timeout = setTimeout(() => {
        textareaRef.current?.focus();
      }, 400); // Wait for animation
      return () => clearTimeout(timeout);
    }
  }, [isLoadingQuestion, currentQuestion]);

  // Handle multiselect option toggle
  const handleOptionToggle = useCallback((option: string) => {
    setMultiSelectAnswers(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  }, []);

  // Save answer and advance
  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    const answerValue = currentQuestion.inputType === 'multiselect'
      ? multiSelectAnswers.join(', ')
      : currentAnswer.trim();

    saveAnswer({
      questionId: `q-${questionNumber}`,
      question: currentQuestion.question,
      answer: answerValue,
      timestamp: Date.now(),
    });

    setDirection('forward');
    setCurrentAnswer('');
    setMultiSelectAnswers([]);
    resetTranscript();
    setQuestionNumber(prev => prev + 1);
  }, [currentQuestion, currentAnswer, multiSelectAnswers, questionNumber, saveAnswer, resetTranscript]);

  // Skip without saving answer
  const handleSkip = useCallback(() => {
    setDirection('forward');
    setCurrentAnswer('');
    setMultiSelectAnswers([]);
    resetTranscript();
    setQuestionNumber(prev => prev + 1);
  }, [resetTranscript]);

  // Go back to previous question
  const handleBack = useCallback(() => {
    if (questionNumber <= 1) {
      prevStep();
      return;
    }

    setDirection('backward');
    setCurrentAnswer('');
    setMultiSelectAnswers([]);
    resetTranscript();
    setQuestionNumber(prev => prev - 1);
  }, [questionNumber, prevStep, resetTranscript]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const canSubmit = currentQuestion?.inputType === 'multiselect'
        ? multiSelectAnswers.length > 0
        : currentAnswer.trim().length > 0;
      if (canSubmit) {
        handleNext();
      }
    }
  }, [handleNext, currentQuestion, currentAnswer, multiSelectAnswers]);

  // Progress bar: logarithmic approach, caps at 90%
  const progressWidth = Math.min(90, questionNumber * 10);

  // Determine if Next should be disabled
  const isNextDisabled = currentQuestion?.inputType === 'multiselect'
    ? multiSelectAnswers.length === 0
    : currentAnswer.trim().length === 0;

  // Animation variants
  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6 py-6 sm:py-8">
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full mb-2">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Question {questionNumber}
        </p>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Loading skeleton */}
          {isLoadingQuestion && !fetchError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="shimmer h-8 rounded-lg" style={{ width: '85%' }} />
              <div className="shimmer h-8 rounded-lg" style={{ width: '65%' }} />
              <div className="shimmer h-5 rounded-lg mt-6" style={{ width: '45%' }} />
            </motion.div>
          )}

          {/* Error state */}
          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <p className="text-base" style={{ color: 'var(--error)' }}>
                {fetchError}
              </p>
              <button
                onClick={fetchNextQuestion}
                className="btn-primary"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Question display */}
          {!isLoadingQuestion && !fetchError && currentQuestion && (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`q-${questionNumber}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {/* Question text */}
                <motion.h2
                  className="question-dramatic mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {currentQuestion.question}
                </motion.h2>

                {/* Subtext */}
                {currentQuestion.subtext && (
                  <motion.p
                    className="text-base mb-8"
                    style={{ color: 'var(--muted)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentQuestion.subtext}
                  </motion.p>
                )}

                {/* Input area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Multiselect input */}
                  {currentQuestion.inputType === 'multiselect' && currentQuestion.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = multiSelectAnswers.includes(option);
                        return (
                          <motion.button
                            key={option}
                            type="button"
                            onClick={() => handleOptionToggle(option)}
                            className={`
                              p-4 rounded-lg border-2 text-left transition-all
                              ${isSelected
                                ? 'border-[var(--primary)] text-white'
                                : 'border-[var(--border)] hover:border-[var(--primary-light)]'
                              }
                            `}
                            style={{
                              background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                              color: isSelected ? 'white' : 'var(--ink)',
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.04 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                                style={{
                                  borderColor: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--border)',
                                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                                }}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm sm:text-base">{option}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Textarea input (default) */}
                  {currentQuestion.inputType !== 'multiselect' && (
                    <>
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={currentAnswer + (interimTranscript ? (currentAnswer ? ' ' : '') + interimTranscript : '')}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            if (!interimTranscript) {
                              setCurrentAnswer(newValue);
                            } else {
                              // Extract just the permanent part when interim transcript is active
                              const interimLength = interimTranscript.length + (currentAnswer ? 1 : 0);
                              const permanentPart = newValue.slice(0, newValue.length - interimLength);
                              setCurrentAnswer(permanentPart);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Share your thoughts..."
                          rows={5}
                          maxLength={MAX_ANSWER_LENGTH}
                          className="textarea-clean"
                        />

                        {/* Voice input button */}
                        {voiceSupported && (
                          <motion.button
                            onClick={toggleListening}
                            className={`btn-voice absolute top-3 right-3 ${isListening ? 'recording voice-pulse' : ''}`}
                            style={{ width: 48, height: 48 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={isListening ? 'Stop recording' : 'Start voice input'}
                          >
                            {isListening ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                />
                              </svg>
                            )}
                          </motion.button>
                        )}
                      </div>

                      {/* Interim transcript indicator */}
                      {isListening && interimTranscript && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm italic mt-2"
                          style={{ color: 'var(--muted)' }}
                        >
                          {interimTranscript}
                        </motion.p>
                      )}

                      {/* Listening indicator */}
                      {isListening && !interimTranscript && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 mt-2"
                        >
                          <div className="flex items-end gap-0.5 h-4">
                            {[0, 1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className="w-0.5 rounded-full sound-wave-bar"
                                style={{ background: 'var(--primary)', minHeight: 4 }}
                              />
                            ))}
                          </div>
                          <span className="text-sm" style={{ color: 'var(--primary)' }}>
                            Listening...
                          </span>
                        </motion.div>
                      )}

                      {/* Character counter -- visible when getting long */}
                      {currentAnswer.length > MAX_ANSWER_LENGTH * 0.8 && (
                        <div
                          className="text-right text-xs mt-1"
                          style={{
                            color: currentAnswer.length >= MAX_ANSWER_LENGTH
                              ? 'var(--error)'
                              : 'var(--muted)',
                          }}
                        >
                          {currentAnswer.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
                        </div>
                      )}

                      {/* Voice error message */}
                      {voiceError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 text-sm italic"
                          style={{ color: 'var(--error)' }}
                        >
                          {voiceError === 'not-allowed'
                            ? 'Microphone access denied. Please allow microphone access and try again.'
                            : voiceError === 'no-speech'
                            ? 'No speech detected. Try speaking closer to the microphone.'
                            : `Voice input error: ${voiceError}`}
                        </motion.p>
                      )}

                      {/* Keyboard shortcut hint */}
                      {currentAnswer.trim().length > 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xs mt-2"
                          style={{ color: 'var(--muted)' }}
                        >
                          Press {navigator.platform?.includes('Mac') ? 'Cmd' : 'Ctrl'} + Enter to continue
                        </motion.p>
                      )}
                    </>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      {!isLoadingQuestion && !fetchError && currentQuestion && (
        <motion.div
          className="max-w-2xl mx-auto w-full flex items-center justify-between mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {/* Back */}
          <button
            onClick={handleBack}
            className="btn-ghost flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="btn-ghost"
            >
              Skip
            </button>

            {/* Next */}
            <motion.button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="btn-primary inline-flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
