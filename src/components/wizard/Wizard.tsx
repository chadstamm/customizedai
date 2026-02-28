'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';
import { IntroStep } from './IntroStep';
import { ModelSelectionStep } from './ModelSelectionStep';
import { FoundationStep } from './FoundationStep';
import { QuestionStep } from './QuestionStep';
import { GeneratingStep } from './GeneratingStep';
import { ResultsStep } from './ResultsStep';

export function Wizard() {
  const { state, hasSavedProgress, resumeProgress, clearSavedProgress } = useWizard();
  const [showResumeBanner, setShowResumeBanner] = useState(true);

  const renderStep = () => {
    // Step 0: Intro / landing page
    if (state.currentStep === 0) {
      return <IntroStep />;
    }

    // Step 1: Model selection
    if (state.currentStep === 1) {
      return <ModelSelectionStep />;
    }

    // Step 2: Foundation (codex / constitution upload)
    if (state.currentStep === 2) {
      return <FoundationStep />;
    }

    // Generation complete — show results
    if (state.isComplete) {
      return <ResultsStep />;
    }

    // Generating in progress
    if (state.isGenerating || state.generationPhase !== 'idle') {
      return <GeneratingStep />;
    }

    // Steps 3+ — AI-driven questions
    if (state.currentStep >= 3) {
      return <QuestionStep />;
    }

    return <IntroStep />;
  };

  // Determine a stable key for AnimatePresence transitions
  const getStepKey = () => {
    if (state.currentStep === 0) return 'intro';
    if (state.currentStep === 1) return 'model-selection';
    if (state.currentStep === 2) return 'foundation';
    if (state.isComplete) return 'results';
    if (state.isGenerating || state.generationPhase !== 'idle') return 'generating';
    return `question-${state.currentStep}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Decorative background elements — indigo/teal gradient mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-right: animated radial gradient (primary/indigo) */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            opacity: 0.06,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bottom-left: animated radial gradient (accent/teal) */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            opacity: 0.04,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Resume banner — shows on intro when saved progress exists */}
      {state.currentStep === 0 && hasSavedProgress && showResumeBanner && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
          style={{ background: 'var(--primary)' }}
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm text-white">You have saved progress. Pick up where you left off?</p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => resumeProgress()}
                className="px-4 py-1.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Resume
              </button>
              <button
                onClick={() => { clearSavedProgress(); setShowResumeBanner(false); }}
                className="text-sm text-white opacity-60 hover:opacity-100 transition-opacity"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <main className="relative z-10 min-h-screen pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={getStepKey()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 pb-6 text-center z-20">
        <div className="mb-2">
          <a
            href="https://buymeacoffee.com/chadn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs link-accent"
          >
            Donate
          </a>
          <span className="text-xs mx-3" style={{ color: 'var(--ink)', opacity: 0.5 }}>·</span>
          <span className="text-xs" style={{ color: 'var(--ink)', opacity: 0.7 }}>
            &copy; 2026 MyCustomAI
          </span>
          <span className="text-xs mx-3" style={{ color: 'var(--ink)', opacity: 0.5 }}>·</span>
          <button
            className="text-xs link-accent"
          >
            About
          </button>
        </div>
        <div className="text-xs" style={{ color: 'var(--ink)', opacity: 0.5 }}>
          Powered by{' '}
          <a
            href="https://chadstamm.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            Chad Stamm
          </a>
          {' & '}
          <a
            href="https://tmcdigitalmedia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            TMC Digital Media
          </a>
        </div>
      </footer>
    </div>
  );
}
