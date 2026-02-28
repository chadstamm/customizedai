'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';
import { AIModelId } from '@/types/models';
import { getModelById } from '@/data/models';
import { ModelTab } from '@/components/results/ModelTab';

export function ResultsStep() {
  const { state, reset } = useWizard();
  const { generationResult, selectedModels } = state;

  // Active tab defaults to first selected model
  const [activeTab, setActiveTab] = useState<AIModelId>(selectedModels[0] || 'chatgpt');

  // Guard: if no result, show fallback
  if (!generationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            No results available.
          </p>
          <button onClick={reset} className="btn-primary">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen px-4 sm:px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          {/* Animated checkmark */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: 'var(--success)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <motion.svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </motion.svg>
          </motion.div>

          <motion.h1
            className="font-display text-3xl md:text-4xl font-semibold mb-3"
            style={{ color: 'var(--ink)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Your Custom Instructions Are Ready
          </motion.h1>

          <motion.p
            className="text-base"
            style={{ color: 'var(--muted)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Copy each section into the corresponding platform&apos;s settings.
          </motion.p>
        </div>

        {/* Tab bar — sticky */}
        <motion.div
          className="sticky top-0 z-30 pb-px -mx-4 sm:-mx-6 px-4 sm:px-6"
          style={{ background: 'var(--bg)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="tab-bar relative">
            {selectedModels.map((modelId) => {
              const model = getModelById(modelId);
              const isActive = activeTab === modelId;

              return (
                <button
                  key={modelId}
                  onClick={() => setActiveTab(modelId)}
                  className={`tab-item relative ${isActive ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    {/* Colored dot */}
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: model.color }}
                    />
                    {model.name}
                  </span>

                  {/* Active underline indicator with layout animation */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'var(--primary)' }}
                      layoutId="activeTabIndicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab content */}
        <div className="pt-8 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ModelTab modelId={activeTab} result={generationResult} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom section */}
        <div className="border-t pt-8 pb-4 text-center" style={{ borderColor: 'var(--border)' }}>
          <motion.button
            onClick={reset}
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Over
          </motion.button>

          <p className="text-xs mt-6" style={{ color: 'var(--muted)', opacity: 0.6 }}>
            Made with MyCustomAI
          </p>
        </div>
      </div>
    </motion.div>
  );
}
