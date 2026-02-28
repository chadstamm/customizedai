'use client';

import { ModelFieldSpec } from '@/types/models';
import { CopyButton } from './CopyButton';

interface FieldDisplayProps {
  fieldSpec: ModelFieldSpec;
  value: string;
  reasoning?: string;
}

export function FieldDisplay({ fieldSpec, value, reasoning }: FieldDisplayProps) {
  const { type, label, charLimit, options, helpText, navigationPath } = fieldSpec;

  // Navigation path helper
  const NavigationPath = () =>
    navigationPath ? (
      <div className="flex items-center gap-1.5 mt-2">
        {/* Arrow icon */}
        <svg
          className="w-3 h-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          Paste into: {navigationPath}
        </span>
      </div>
    ) : null;

  // --- TEXTAREA ---
  if (type === 'textarea') {
    const length = value.length;
    const isOverLimit = charLimit ? length > charLimit : false;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {label}
          </label>
        </div>

        <div className="relative">
          <div
            className="w-full rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              lineHeight: '1.7',
              minHeight: '100px',
            }}
          >
            {value}
          </div>

          {/* Copy button in top-right corner */}
          <div className="absolute top-2 right-2">
            <CopyButton text={value} />
          </div>
        </div>

        {/* Character count */}
        {charLimit && (
          <div className="flex justify-end mt-1">
            <span
              className="text-xs font-medium"
              style={{ color: isOverLimit ? 'var(--error)' : 'var(--success)' }}
            >
              {length}/{charLimit}
            </span>
          </div>
        )}

        <NavigationPath />
      </div>
    );
  }

  // --- TEXT ---
  if (type === 'text') {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {label}:
          </label>
          <span className="text-sm" style={{ color: 'var(--ink-light)' }}>
            {value}
          </span>
          <CopyButton text={value} />
        </div>
        <NavigationPath />
      </div>
    );
  }

  // --- DROPDOWN ---
  if (type === 'dropdown') {
    return (
      <div className="mb-6">
        <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--ink)' }}>
          {label}
        </label>
        {helpText && (
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
            {helpText}
          </p>
        )}

        {/* Option pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(options || []).map((option) => {
            const isSelected = option === value;
            return (
              <span
                key={option}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: isSelected ? 'var(--primary)' : 'var(--border-light)',
                  color: isSelected ? '#FFFFFF' : 'var(--muted)',
                }}
              >
                {option}
              </span>
            );
          })}
          <CopyButton text={value} />
        </div>

        {/* Reasoning callout */}
        {reasoning && (
          <div
            className="rounded-lg p-3 text-xs leading-relaxed"
            style={{
              background: 'rgba(79, 70, 229, 0.05)',
              color: 'var(--ink-light)',
            }}
          >
            <span className="font-medium" style={{ color: 'var(--primary)' }}>
              Why this choice:
            </span>{' '}
            {reasoning}
          </div>
        )}

        <NavigationPath />
      </div>
    );
  }

  // --- THREE-WAY ---
  if (type === 'three-way') {
    const threeWayOptions = ['More', 'Default', 'Less'];

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              {label}
            </label>
            {helpText && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {helpText}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1.5">
          {threeWayOptions.map((option) => {
            const isSelected = option === value;
            return (
              <span
                key={option}
                className="flex-1 text-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: isSelected ? 'var(--primary)' : 'var(--border-light)',
                  color: isSelected ? '#FFFFFF' : 'var(--muted)',
                }}
              >
                {option}
              </span>
            );
          })}
        </div>

        <NavigationPath />
      </div>
    );
  }

  // Fallback
  return (
    <div className="mb-6">
      <label className="text-sm font-semibold block mb-1" style={{ color: 'var(--ink)' }}>
        {label}
      </label>
      <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
        {value}
      </p>
    </div>
  );
}
