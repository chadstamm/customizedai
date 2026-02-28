'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { AIModelId, GenerationResult } from '@/types/models';
import { getModelById } from '@/data/models';
import { MODEL_FIELDS } from '@/data/models';
import { FieldDisplay } from './FieldDisplay';
import { CopyButton } from './CopyButton';

interface ModelTabProps {
  modelId: AIModelId;
  result: GenerationResult;
}

// Helper to safely get a value from a model result object
function getFieldValue(modelResult: Record<string, unknown>, fieldId: string): string {
  const val = modelResult[fieldId];
  return typeof val === 'string' ? val : '';
}

// Helper to get reasoning for a field
function getFieldReasoning(modelResult: Record<string, unknown>, fieldId: string): string | undefined {
  // Convention: reasoning field is named "{fieldId}Reasoning"
  const reasoningKey = `${fieldId}Reasoning`;
  const val = modelResult[reasoningKey];
  return typeof val === 'string' ? val : undefined;
}

export function ModelTab({ modelId, result }: ModelTabProps) {
  const model = getModelById(modelId);
  const fieldSpecs = MODEL_FIELDS[modelId];
  const modelResult = result[modelId] as Record<string, unknown> | undefined;

  // Build "Copy All" text for this model
  const buildCopyAllText = useCallback(() => {
    if (!modelResult) return '';

    const lines: string[] = [];

    if (modelId === 'chatgpt') {
      const r = modelResult;
      if (r.nickname) lines.push(`Nickname: ${r.nickname}`);
      if (r.occupation) lines.push(`Occupation: ${r.occupation}`);
      lines.push('');
      if (r.knowAboutYou) {
        lines.push('What would you like ChatGPT to know about you?');
        lines.push(String(r.knowAboutYou));
        lines.push('');
      }
      if (r.howToRespond) {
        lines.push('How would you like ChatGPT to respond?');
        lines.push(String(r.howToRespond));
        lines.push('');
      }
      if (r.personality) {
        lines.push(`Recommended Personality: ${r.personality}`);
      }
      const chars = [
        r.warm ? `Warm: ${r.warm}` : null,
        r.enthusiastic ? `Enthusiastic: ${r.enthusiastic}` : null,
        r.headersAndLists ? `Headers & Lists: ${r.headersAndLists}` : null,
        r.emoji ? `Emoji: ${r.emoji}` : null,
      ].filter(Boolean);
      if (chars.length > 0) {
        lines.push(chars.join(' | '));
      }
    } else if (modelId === 'claude') {
      const r = modelResult;
      if (r.profilePreferences) {
        lines.push('Profile Preferences:');
        lines.push(String(r.profilePreferences));
        lines.push('');
      }
      if (r.recommendedStyle) {
        lines.push(`Recommended Style: ${r.recommendedStyle}`);
      }
      if (r.customStyleGuidance) {
        lines.push('');
        lines.push('Custom Style Guidance:');
        lines.push(String(r.customStyleGuidance));
      }
    } else {
      // Generic: iterate fields
      for (const spec of fieldSpecs) {
        const val = getFieldValue(modelResult, spec.id);
        if (val) {
          if (spec.type === 'textarea') {
            lines.push(`${spec.label}:`);
            lines.push(val);
            lines.push('');
          } else {
            lines.push(`${spec.label}: ${val}`);
          }
        }
      }
    }

    return lines.join('\n').trim();
  }, [modelId, modelResult, fieldSpecs]);

  if (!modelResult) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          No results generated for {model.name}.
        </p>
      </div>
    );
  }

  // ChatGPT-specific: identify characteristic fields
  const characteristicIds = ['warm', 'enthusiastic', 'headersAndLists', 'emoji'];
  const isChatGPT = modelId === 'chatgpt';
  const isClaude = modelId === 'claude';

  // Split fields for ChatGPT grouping
  const regularFields = isChatGPT
    ? fieldSpecs.filter((f) => !characteristicIds.includes(f.id))
    : fieldSpecs;

  const characteristicFields = isChatGPT
    ? fieldSpecs.filter((f) => characteristicIds.includes(f.id))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Model header with accent bar */}
      <div className="mb-6">
        <div
          className="h-1 w-16 rounded-full mb-4"
          style={{ background: model.color }}
        />
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
            {model.name}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border-light)', color: 'var(--muted)' }}>
            {model.company}
          </span>
        </div>
      </div>

      {/* Regular fields */}
      {regularFields.map((spec) => (
        <FieldDisplay
          key={spec.id}
          fieldSpec={spec}
          value={getFieldValue(modelResult, spec.id)}
          reasoning={getFieldReasoning(modelResult, spec.id)}
        />
      ))}

      {/* ChatGPT: Characteristics group */}
      {isChatGPT && characteristicFields.length > 0 && (
        <div className="mb-6">
          <h4
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--ink)' }}
          >
            {/* Sliders icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Characteristics
          </h4>

          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--border-light)',
              border: '1px solid var(--border)',
            }}
          >
            {characteristicFields.map((spec) => (
              <FieldDisplay
                key={spec.id}
                fieldSpec={spec}
                value={getFieldValue(modelResult, spec.id)}
              />
            ))}
          </div>

          {/* Characteristics reasoning */}
          {typeof modelResult.characteristicsReasoning === 'string' && modelResult.characteristicsReasoning && (
            <div
              className="rounded-lg p-3 mt-3 text-xs leading-relaxed"
              style={{
                background: 'rgba(79, 70, 229, 0.05)',
                color: 'var(--ink-light)',
              }}
            >
              <span className="font-medium" style={{ color: 'var(--primary)' }}>
                Why these settings:
              </span>{' '}
              {String(modelResult.characteristicsReasoning)}
            </div>
          )}
        </div>
      )}

      {/* Claude: Custom Style Guidance callout */}
      {isClaude && typeof modelResult.customStyleGuidance === 'string' && modelResult.customStyleGuidance && (
        <div className="mb-6">
          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(212, 165, 116, 0.08)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                {/* Sparkle icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: model.color }}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Custom Style Guidance
              </h4>
              <CopyButton text={String(modelResult.customStyleGuidance)} />
            </div>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--ink-light)' }}
            >
              {String(modelResult.customStyleGuidance)}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
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
                Use this text when creating a Custom Style in Claude
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Copy All button */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Copy all {model.name} settings at once
          </span>
          <CopyButton text={buildCopyAllText()} label={`Copy All for ${model.name}`} />
        </div>
      </div>
    </motion.div>
  );
}
