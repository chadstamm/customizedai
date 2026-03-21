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
  const [showAbout, setShowAbout] = useState(false);

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

      {/* Home icon — visible on inner pages */}
      {state.currentStep > 0 && !state.isComplete && (
        <motion.button
          onClick={() => {
            if (confirm('Go back to the start? Your progress will be saved.')) {
              window.location.reload();
            }
          }}
          className="fixed top-5 left-5 z-40 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Back to start"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--ink-light)' }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </motion.button>
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
            &copy; 2026 CustomizedAI
          </span>
          <span className="text-xs mx-3" style={{ color: 'var(--ink)', opacity: 0.5 }}>·</span>
          <button
            onClick={() => setShowAbout(true)}
            className="text-xs link-accent cursor-pointer"
          >
            About
          </button>
          <span className="text-xs mx-3" style={{ color: 'var(--ink)', opacity: 0.5 }}>·</span>
          <a
            href="/privacy"
            className="text-xs link-accent"
          >
            Privacy Policy
          </a>
          <span className="text-xs mx-3" style={{ color: 'var(--ink)', opacity: 0.5 }}>·</span>
          <a
            href="https://rumo.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: 'var(--ink)', opacity: 0.4 }}
          >
            Part of the Rumo journey
          </a>
        </div>
        <div className="text-xs" style={{ color: 'var(--ink)', opacity: 0.5 }}>
          Powered by{' '}
          <a href="https://chadstamm.com/" target="_blank" rel="noopener noreferrer" className="link-accent">Chad Stamm</a>
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

      {/* About bottom sheet */}
      <AnimatePresence>
        {showAbout && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-6 py-8 sm:px-8 max-h-[80vh] overflow-y-auto"
              style={{
                background: 'var(--bg-card)',
                boxShadow: '0 -4px 40px rgba(0, 0, 0, 0.15)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drag handle */}
              <div
                className="w-10 h-1 rounded-full mx-auto mb-6"
                style={{ background: 'var(--border)' }}
              />

              <div className="max-w-lg mx-auto">
                <h2
                  className="font-display text-2xl font-semibold mb-4"
                  style={{ color: 'var(--ink)' }}
                >
                  About CustomizedAI
                </h2>
                <div className="space-y-4 text-sm leading-relaxed font-body" style={{ color: 'var(--muted)' }}>
                  <p>
                    Every major AI platform has custom instruction settings &mdash; but each one is different.
                    ChatGPT has dropdowns and text fields. Claude has a text area and style selector. Gemini and Perplexity have their own formats.
                  </p>
                  <p>
                    CustomizedAI asks you a few questions about how you work and communicate,
                    then generates instructions mapped to each platform&apos;s exact fields.
                    No guesswork. Just copy, paste, and go.
                  </p>
                  <p>
                    Built by{' '}
                    <a href="https://chadstamm.com/" target="_blank" rel="noopener noreferrer" className="link-accent font-medium">Chad Stamm</a>
                    {' & '}
                    <a href="https://tmcdigitalmedia.com/" target="_blank" rel="noopener noreferrer" className="link-accent font-medium">
                      TMC Digital Media
                    </a>
                  </p>

                  <div
                    className="pt-4 mt-4"
                    style={{ borderTop: '1px solid var(--border-light)' }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--ink)', opacity: 0.6 }}>
                      More from us
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href="https://writelikeme.coach"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-accent text-sm"
                      >
                        WriteLikeMe &mdash; Create your AI writing voice codex
                      </a>
                      <a
                        href="https://wethe.me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-accent text-sm"
                      >
                        WeTheMe &mdash; Build your personal constitution
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAbout(false)}
                  className="mt-8 w-full py-3 rounded-xl text-sm font-semibold font-body transition-colors"
                  style={{
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
