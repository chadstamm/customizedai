'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';
import { AI_MODELS, MODEL_FIELDS } from '@/data/models';
import { AIModelId } from '@/types/models';

export function ModelSelectionStep() {
  const { state, toggleModel, nextStep, prevStep } = useWizard();
  const { selectedModels } = state;
  const hasSelection = selectedModels.length > 0;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-16 sm:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-3xl">
        {/* Headline */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4"
            style={{ color: 'var(--ink)' }}
          >
            Which AIs do you use?
          </h2>
          <p
            className="text-base sm:text-lg"
            style={{ color: 'var(--muted)' }}
          >
            Select all that apply. We&rsquo;ll create custom instructions for each one.
          </p>
        </motion.div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-12">
          {AI_MODELS.map((model, index) => {
            const isSelected = selectedModels.includes(model.id);
            const fieldCount = MODEL_FIELDS[model.id]?.length ?? 0;

            return (
              <motion.button
                key={model.id}
                type="button"
                onClick={() => toggleModel(model.id)}
                className="relative text-left rounded-2xl p-5 sm:p-6 bg-white cursor-pointer"
                style={{
                  border: `2px solid ${isSelected ? model.color : 'var(--border)'}`,
                  boxShadow: isSelected
                    ? `0 4px 20px ${model.color}20, 0 0 0 1px ${model.color}10`
                    : '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease',
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{
                  y: -2,
                  boxShadow: isSelected
                    ? `0 8px 30px ${model.color}30, 0 0 0 1px ${model.color}15`
                    : '0 8px 24px rgba(0, 0, 0, 0.08)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Top row: avatar + checkbox */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  {/* Model initial circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold font-body flex-shrink-0"
                    style={{ backgroundColor: model.color }}
                  >
                    {model.name.charAt(0)}
                  </div>

                  {/* Checkbox indicator */}
                  <div className="flex-shrink-0">
                    <AnimatePresence mode="wait">
                      {isSelected ? (
                        <motion.div
                          key="checked"
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--primary)' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 25,
                          }}
                        >
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="unchecked"
                          className="w-7 h-7 rounded-full"
                          style={{
                            border: '2px solid var(--border)',
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 25,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Model info */}
                <div>
                  <h3
                    className="font-body text-lg font-bold mb-0.5"
                    style={{ color: 'var(--ink)' }}
                  >
                    {model.name}
                  </h3>
                  <p
                    className="text-sm mb-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {model.company}
                  </p>
                  <p
                    className="text-sm leading-relaxed mb-3"
                    style={{ color: 'var(--ink-light)' }}
                  >
                    {model.description}
                  </p>

                  {/* Field count badge */}
                  <span
                    className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: isSelected ? `${model.color}12` : 'var(--border-light)',
                      color: isSelected ? model.color : 'var(--muted)',
                      transition: 'background-color 0.25s ease, color 0.25s ease',
                    }}
                  >
                    {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Navigation */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          {/* Continue button */}
          <AnimatePresence>
            <motion.button
              onClick={nextStep}
              disabled={!hasSelection}
              className="btn-primary min-w-[240px]"
              animate={{
                opacity: hasSelection ? 1 : 0.5,
                y: hasSelection ? 0 : 4,
              }}
              transition={{ duration: 0.25 }}
              whileHover={hasSelection ? { scale: 1.02 } : undefined}
              whileTap={hasSelection ? { scale: 0.98 } : undefined}
            >
              {hasSelection
                ? `Continue with ${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''}`
                : 'Continue'}
            </motion.button>
          </AnimatePresence>

          {/* Back button */}
          <button
            onClick={prevStep}
            className="btn-ghost"
          >
            Back
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
