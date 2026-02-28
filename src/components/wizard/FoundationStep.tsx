'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '@/context/WizardContext';

// ── Icons (inline SVG) ─────────────────────────────────────────────

function PenIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      <path d="M15 5l4 4" />
    </svg>
  );
}

function ScrollIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UploadIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ── File Upload Drop Zone ───────────────────────────────────────────

const ACCEPTED_TYPES = '.txt,.md,.pdf,.docx';
const ACCEPTED_EXTENSIONS = ['txt', 'md', 'pdf', 'docx'];

interface FileDropZoneProps {
  onTextExtracted: (text: string) => void;
  id: string;
}

function FileDropZone({ onTextExtracted, id }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !ACCEPTED_EXTENSIONS.includes(ext)) {
        setError('Unsupported file type. Use .txt, .md, .pdf, or .docx');
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadedFilename(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-file', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'Failed to parse file');
          return;
        }

        onTextExtracted(data.text);
        setUploadedFilename(file.name);
      } catch {
        setError('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [onTextExtracted],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [handleFile],
  );

  return (
    <div className="mt-3">
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          background: isDragging ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
        }}
      >
        {isUploading ? (
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            Parsing file...
          </span>
        ) : (
          <>
            <UploadIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {uploadedFilename
                ? `Loaded: ${uploadedFilename}`
                : 'or drop a file here'}
            </span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleInputChange}
        className="hidden"
        id={id}
      />

      {/* Accepted types hint */}
      <p
        className="text-xs mt-1.5 text-center"
        style={{ color: 'var(--muted)', opacity: 0.7 }}
      >
        .txt, .md, .pdf, .docx
      </p>

      {/* Error message */}
      {error && (
        <p
          className="text-xs mt-1.5 text-center"
          style={{ color: 'var(--error)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Shared animation config ─────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.25 + i * 0.15,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

// ── Main Component ──────────────────────────────────────────────────

export function FoundationStep() {
  const { state, setWritingCodex, setPersonalConstitution, nextStep, prevStep } = useWizard();

  const writingCodex = state.writingCodex ?? '';
  const personalConstitution = state.personalConstitution ?? '';

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-16 sm:py-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-4xl">
        {/* ── Headline ─────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4"
            style={{ color: 'var(--ink)' }}
          >
            Share Your Foundation
          </h2>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            If you have a Writing Codex or Personal Constitution, paste or upload
            them here. They&apos;ll make your custom instructions even more
            accurate.
          </p>
        </motion.div>

        {/* ── Two cards: side-by-side on desktop, stacked on mobile ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {/* Card 1 — Writing Codex */}
          <motion.div
            className="rounded-2xl p-6 sm:p-7"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(79, 70, 229, 0.08)' }}
            >
              <PenIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>

            {/* Title + description */}
            <h3
              className="font-body text-lg font-bold mb-1"
              style={{ color: 'var(--ink)' }}
            >
              Writing Codex
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--muted)' }}
            >
              Your unique writing voice and style patterns
            </p>

            {/* Textarea */}
            <textarea
              rows={6}
              className="textarea-clean"
              placeholder="Paste your writing codex here..."
              value={writingCodex}
              onChange={(e) => setWritingCodex(e.target.value)}
            />

            {/* File upload */}
            <FileDropZone
              id="codex-file-upload"
              onTextExtracted={(text) => setWritingCodex(text)}
            />

            {/* Cross-promo link */}
            <p className="text-sm mt-4">
              Don&apos;t have one?{' '}
              <a
                href="https://writelikeme.coach"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                Create yours at WriteLikeMe &rarr;
              </a>
            </p>
          </motion.div>

          {/* Card 2 — Personal Constitution */}
          <motion.div
            className="rounded-2xl p-6 sm:p-7"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(6, 182, 212, 0.08)' }}
            >
              <ScrollIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>

            {/* Title + description */}
            <h3
              className="font-body text-lg font-bold mb-1"
              style={{ color: 'var(--ink)' }}
            >
              Personal Constitution
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--muted)' }}
            >
              Your values, principles, and how you want to show up
            </p>

            {/* Textarea */}
            <textarea
              rows={6}
              className="textarea-clean"
              placeholder="Paste your personal constitution here..."
              value={personalConstitution}
              onChange={(e) => setPersonalConstitution(e.target.value)}
            />

            {/* File upload */}
            <FileDropZone
              id="constitution-file-upload"
              onTextExtracted={(text) => setPersonalConstitution(text)}
            />

            {/* Cross-promo link */}
            <p className="text-sm mt-4">
              Don&apos;t have one?{' '}
              <a
                href="https://we-the-me.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                Create yours at We The Me &rarr;
              </a>
            </p>
          </motion.div>
        </div>

        {/* ── Navigation ──────────────────────────────────────── */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          {/* Left: Back */}
          <button onClick={prevStep} className="btn-ghost">
            Back
          </button>

          {/* Right: Skip + Continue */}
          <div className="flex items-center gap-3">
            <button onClick={nextStep} className="btn-ghost">
              Skip this step
            </button>
            <motion.button
              onClick={nextStep}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
