'use client';

import { motion } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';

// Model chip data with brand colors
const modelChips = [
  { name: 'ChatGPT', color: '#10A37F' },
  { name: 'Claude', color: '#D4A574' },
  { name: 'Gemini', color: '#4285F4' },
  { name: 'Perplexity', color: '#20808D' },
];

// How It Works steps
const howItWorksSteps = [
  {
    number: '01',
    title: 'Select Your AIs',
    description:
      'Choose which models you use daily \u2014 ChatGPT, Claude, Gemini, or Perplexity.',
  },
  {
    number: '02',
    title: 'Answer a Few Questions',
    description:
      'Our AI asks about your preferences, communication style, and how you use AI.',
  },
  {
    number: '03',
    title: 'Get Your Instructions',
    description:
      'Copy-paste ready instructions tailored to each platform\u2019s exact settings.',
  },
];

// Shared easing curve
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Stagger container variants
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const chipContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.8,
    },
  },
};

const chipItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
};

export function IntroStep() {
  const { nextStep } = useWizard();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col"
    >
      {/* ================================================================
          HERO SECTION — Dark navy with gradient mesh
          ================================================================ */}
      <section
        className="relative overflow-hidden py-24 sm:py-32 px-5 sm:px-8"
        style={{ background: 'var(--bg-dark)' }}
      >
        {/* Gradient mesh — indigo radial from top-left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(79, 70, 229, 0.15), transparent)',
          }}
        />
        {/* Gradient mesh — teal radial from bottom-right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 80% 90%, rgba(6, 182, 212, 0.1), transparent)',
          }}
        />
        {/* Subtle indigo glow at center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.06), transparent 70%)',
          }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUpItem}
            className="font-display font-bold text-white tracking-tight leading-[1.05]"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Every AI Should Know{' '}
            <span
              className="italic"
              style={{
                background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              You
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUpItem}
            className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255, 255, 255, 0.65)' }}
          >
            Create perfect custom instructions for ChatGPT, Claude, Gemini, and
            Perplexity &mdash; tailored to each platform&apos;s exact settings.
          </motion.p>

          {/* Model chips */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            variants={chipContainer}
            initial="hidden"
            animate="visible"
          >
            {modelChips.map((model) => (
              <motion.div
                key={model.name}
                variants={chipItem}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: model.color }}
                />
                {model.name}
              </motion.div>
            ))}
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeUpItem} className="mt-10 sm:mt-12">
            <motion.button
              onClick={nextStep}
              whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(79, 70, 229, 0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 font-body font-semibold text-sm sm:text-base tracking-wide px-8 sm:px-10 py-4 sm:py-5 rounded-xl cursor-pointer transition-colors duration-200"
              style={{
                background: 'var(--primary)',
                color: '#FFFFFF',
                boxShadow: '0 4px 24px rgba(79, 70, 229, 0.3)',
              }}
            >
              Build My Instructions
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </motion.button>

            <p
              className="mt-4 text-xs sm:text-sm tracking-wide"
              style={{ color: 'rgba(255, 255, 255, 0.3)' }}
            >
              Free &middot; No sign-up required &middot; Takes 5 minutes
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3, y: [0, 6, 0] }}
          transition={{
            delay: 2.0,
            opacity: { delay: 2.0, duration: 0.6 },
            y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ================================================================
          HOW IT WORKS SECTION — Light background
          ================================================================ */}
      <section
        className="py-20 sm:py-28 px-5 sm:px-8"
        style={{ background: 'var(--bg)' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14 sm:mb-20"
          >
            <p
              className="text-xs font-medium tracking-[0.25em] uppercase mb-4 font-body"
              style={{ color: 'var(--primary)' }}
            >
              Simple Process
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight"
              style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
            >
              How It Works
            </h2>
          </motion.div>

          {/* 3-column cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.5, ease }}
                className="relative group"
              >
                {/* Oversized decorative number */}
                <span
                  className="absolute -top-6 -left-1 font-display font-bold leading-none select-none pointer-events-none"
                  style={{
                    fontSize: 'clamp(3rem, 8vw, 5rem)',
                    color: 'var(--primary)',
                    opacity: 0.08,
                  }}
                >
                  {step.number}
                </span>

                {/* Card */}
                <div
                  className="relative rounded-2xl p-7 sm:p-8 pt-10 transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background: 'var(--bg-card)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                    }}
                  />

                  <p
                    className="text-xs font-semibold tracking-[0.15em] uppercase mb-3 font-body"
                    style={{ color: 'var(--primary)' }}
                  >
                    Step {step.number}
                  </p>
                  <h3
                    className="font-display text-xl sm:text-2xl font-semibold mb-3"
                    style={{ color: 'var(--ink)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm sm:text-base leading-relaxed font-body"
                    style={{ color: 'var(--muted)' }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          BOTTOM CTA SECTION
          ================================================================ */}
      <section
        className="py-20 sm:py-28 px-5 sm:px-8 relative overflow-hidden"
        style={{ background: 'var(--bg-dark)' }}
      >
        {/* Subtle gradient accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(79, 70, 229, 0.08), transparent)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="w-16 h-px mx-auto mb-10"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--primary-light), transparent)',
              opacity: 0.4,
            }}
          />

          <p
            className="font-display text-xl sm:text-2xl md:text-3xl font-light leading-snug mb-10"
            style={{ color: 'rgba(255, 255, 255, 0.85)' }}
          >
            Ready to make every AI conversation feel like it was{' '}
            <span
              className="italic font-normal"
              style={{ color: 'var(--accent-light)' }}
            >
              made for you
            </span>
            ?
          </p>

          <motion.button
            onClick={nextStep}
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(79, 70, 229, 0.35)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 font-body font-semibold text-sm sm:text-base tracking-wide px-8 sm:px-10 py-4 sm:py-5 rounded-xl cursor-pointer transition-colors duration-200"
            style={{
              background: '#FFFFFF',
              color: 'var(--bg-dark)',
              boxShadow: '0 4px 24px rgba(255, 255, 255, 0.1)',
            }}
          >
            Build My Instructions
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.button>
        </motion.div>
      </section>
    </motion.div>
  );
}
