'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';

const STATUS_MESSAGES = [
  'Understanding your communication style...',
  'Mapping your preferences to each platform...',
  'Identifying your ideal AI personality...',
  'Preparing your custom instructions...',
];

export function GeneratingStep() {
  const { state, retryGeneration, reset } = useWizard();
  const [statusIndex, setStatusIndex] = useState(0);

  // Rotate status messages every 3 seconds during the waiting-for-insights phase
  useEffect(() => {
    if (state.generationPhase !== 'waiting-for-insights') return;

    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [state.generationPhase]);

  // Reset status index when entering waiting-for-insights
  useEffect(() => {
    if (state.generationPhase === 'waiting-for-insights') {
      setStatusIndex(0);
    }
  }, [state.generationPhase]);

  const isWaitingForInsights = state.generationPhase === 'waiting-for-insights';
  const isGeneratingOrStreaming = state.generationPhase === 'generating' || state.generationPhase === 'streaming';
  const hasError = !!state.error;

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Error icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
            style={{ background: 'var(--error)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>

          <h2
            className="font-display text-3xl font-semibold mb-4"
            style={{ color: 'var(--ink)' }}
          >
            Something went wrong
          </h2>

          <p className="text-base mb-8" style={{ color: 'var(--muted)' }}>
            {state.error}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => retryGeneration()}
              className="btn-primary inline-flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </motion.button>

            <motion.button
              onClick={reset}
              className="btn-ghost"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Over
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Waiting for insights phase
  if (isWaitingForInsights) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated sparkles icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
            style={{ background: 'var(--primary)' }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </motion.svg>
          </motion.div>

          <h2
            className="font-display text-3xl md:text-4xl font-semibold mb-4"
            style={{ color: 'var(--ink)' }}
          >
            Analyzing your preferences...
          </h2>

          {/* Rotating status messages */}
          <div className="h-8 mb-8 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                className="text-base absolute inset-x-0"
                style={{ color: 'var(--muted)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {STATUS_MESSAGES[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Shimmer bar */}
          <div className="max-w-xs mx-auto h-1 rounded-full overflow-hidden shimmer" />
        </motion.div>
      </div>
    );
  }

  // Generating / Streaming phase
  if (isGeneratingOrStreaming) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <motion.div
          className="text-center max-w-lg w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Pulsing indigo dot */}
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-8"
            style={{ background: 'rgba(79, 70, 229, 0.1)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="w-5 h-5 rounded-full"
              style={{ background: 'var(--primary)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <h2
            className="font-display text-3xl md:text-4xl font-semibold mb-4"
            style={{ color: 'var(--ink)' }}
          >
            Building your custom instructions...
          </h2>

          <p className="text-base mb-8" style={{ color: 'var(--muted)' }}>
            This typically takes 10-30 seconds.
          </p>

          {/* Stream preview */}
          {state.streamedText && (
            <motion.div
              className="rounded-xl overflow-hidden mb-8 text-left"
              style={{
                background: 'var(--border-light)',
                maxHeight: '200px',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-4 overflow-hidden" style={{ maxHeight: '200px' }}>
                <pre
                  className="whitespace-pre-wrap text-xs font-mono leading-relaxed"
                  style={{ color: 'var(--ink)', opacity: 0.15 }}
                >
                  {state.streamedText.slice(0, 200)}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Bouncing dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--primary)' }}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Fallback (idle or transitioning)
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--primary)' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
