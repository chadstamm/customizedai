'use client';

import { motion } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';

export function ResultsStep() {
  const { reset } = useWizard();

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-card p-12 text-center max-w-md">
        <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>
          ResultsStep
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Placeholder — will show tabbed results output.
        </p>
        <button onClick={reset} className="btn-primary">
          Start Over
        </button>
      </div>
    </motion.div>
  );
}
