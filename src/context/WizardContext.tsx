'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useRef, ReactNode } from 'react';
import { WizardState, WizardAnswer, AnalyzedInsight, GenerationPhase } from '@/types/wizard';
import { AIModelId, GenerationResult } from '@/types/models';

const STORAGE_KEY = 'mycustomai-wizard-state';

// Initial state
const initialState: WizardState = {
  currentStep: 0,
  selectedModels: [],
  writingCodex: null,
  personalConstitution: null,
  answers: [],
  analyzedInsights: [],
  isComplete: false,
  isGenerating: false,
  generationPhase: 'idle',
  generationResult: null,
  streamedText: null,
  error: null,
};

// Action types
type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'TOGGLE_MODEL'; payload: AIModelId }
  | { type: 'SET_WRITING_CODEX'; payload: string }
  | { type: 'SET_PERSONAL_CONSTITUTION'; payload: string }
  | { type: 'SAVE_ANSWER'; payload: WizardAnswer }
  | { type: 'SET_INSIGHT'; payload: AnalyzedInsight }
  | { type: 'START_GENERATING' }
  | { type: 'SET_GENERATION_PHASE'; payload: GenerationPhase }
  | { type: 'APPEND_STREAMED_TEXT'; payload: string }
  | { type: 'GENERATION_SUCCESS'; payload: GenerationResult }
  | { type: 'GENERATION_ERROR'; payload: string }
  | { type: 'RESTORE_STATE'; payload: Partial<WizardState> }
  | { type: 'RESET' };

// Reducer
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: null };

    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1, error: null };

    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(0, state.currentStep - 1), error: null };

    case 'TOGGLE_MODEL': {
      const modelId = action.payload;
      const exists = state.selectedModels.includes(modelId);
      const newModels = exists
        ? state.selectedModels.filter(id => id !== modelId)
        : [...state.selectedModels, modelId];
      return { ...state, selectedModels: newModels };
    }

    case 'SET_WRITING_CODEX':
      return { ...state, writingCodex: action.payload };

    case 'SET_PERSONAL_CONSTITUTION':
      return { ...state, personalConstitution: action.payload };

    case 'SAVE_ANSWER': {
      const existingIndex = state.answers.findIndex(a => a.questionId === action.payload.questionId);
      const newAnswers = existingIndex >= 0
        ? state.answers.map((a, i) => i === existingIndex ? action.payload : a)
        : [...state.answers, action.payload];
      return { ...state, answers: newAnswers };
    }

    case 'SET_INSIGHT': {
      const existingIdx = state.analyzedInsights.findIndex(i => i.questionId === action.payload.questionId);
      const newInsights = existingIdx >= 0
        ? state.analyzedInsights.map((i, idx) => idx === existingIdx ? action.payload : i)
        : [...state.analyzedInsights, action.payload];
      return { ...state, analyzedInsights: newInsights };
    }

    case 'START_GENERATING':
      return {
        ...state,
        isGenerating: true,
        generationPhase: 'waiting-for-insights',
        generationResult: null,
        streamedText: null,
        error: null,
      };

    case 'SET_GENERATION_PHASE':
      return { ...state, generationPhase: action.payload };

    case 'APPEND_STREAMED_TEXT':
      return { ...state, streamedText: (state.streamedText || '') + action.payload };

    case 'GENERATION_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        isComplete: true,
        generationPhase: 'idle',
        generationResult: action.payload,
      };

    case 'GENERATION_ERROR':
      return { ...state, isGenerating: false, generationPhase: 'idle', error: action.payload };

    case 'RESTORE_STATE':
      return { ...initialState, ...action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context type
interface WizardContextType {
  state: WizardState;
  // Model selection
  toggleModel: (modelId: AIModelId) => void;
  // Foundation inputs
  setWritingCodex: (text: string) => void;
  setPersonalConstitution: (text: string) => void;
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  // Answers
  saveAnswer: (answer: WizardAnswer) => void;
  getAnswer: (questionId: string) => WizardAnswer | undefined;
  // Generation
  generateInstructions: () => Promise<void>;
  retryGeneration: () => Promise<void>;
  // Session persistence
  hasSavedProgress: boolean;
  resumeProgress: () => void;
  clearSavedProgress: () => void;
  // Utility
  reset: () => void;
  canProceed: () => boolean;
}

const WizardContext = createContext<WizardContextType | null>(null);

// Provider component
export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [savedState, setSavedState] = useState<Partial<WizardState> | null>(null);

  // Ref to access latest state inside async functions (avoids stale closures)
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && parsed.answers.length > 0) {
          setSavedState(parsed);
        }
      }
    } catch { /* ignore parse errors */ }
    setHydrated(true);
  }, []);

  // Save to localStorage when state changes (only during active progress)
  useEffect(() => {
    if (!hydrated) return;
    if (state.currentStep > 0 && !state.isComplete && !state.isGenerating) {
      const toSave = {
        currentStep: state.currentStep,
        selectedModels: state.selectedModels,
        writingCodex: state.writingCodex,
        personalConstitution: state.personalConstitution,
        answers: state.answers,
        analyzedInsights: state.analyzedInsights,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
    if (state.isComplete) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state, hydrated]);

  // Session persistence
  const hasSavedProgress = savedState !== null && (savedState.answers?.length ?? 0) > 0;

  const resumeProgress = useCallback(() => {
    if (savedState) {
      dispatch({
        type: 'RESTORE_STATE',
        payload: {
          ...savedState,
          isGenerating: false,
          isComplete: false,
          generationPhase: 'idle' as GenerationPhase,
          generationResult: null,
          streamedText: null,
          error: null,
        },
      });
      setSavedState(null);
    }
  }, [savedState]);

  const clearSavedProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedState(null);
  }, []);

  // Background analysis (fire-and-forget)
  const analyzeAnswerInBackground = useCallback(async (answer: WizardAnswer) => {
    if (!answer.answer.trim()) return;

    dispatch({ type: 'SET_INSIGHT', payload: { questionId: answer.questionId, insight: '', status: 'analyzing' } });

    try {
      const response = await fetch('/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: answer.question, answer: answer.answer }),
      });
      const data = await response.json();
      dispatch({
        type: 'SET_INSIGHT',
        payload: {
          questionId: answer.questionId,
          insight: data.success ? data.insight : '',
          status: data.success ? 'complete' : 'error',
        },
      });
    } catch {
      dispatch({ type: 'SET_INSIGHT', payload: { questionId: answer.questionId, insight: '', status: 'error' } });
    }
  }, []);

  // Navigation
  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  // Model selection
  const toggleModel = useCallback((modelId: AIModelId) => {
    dispatch({ type: 'TOGGLE_MODEL', payload: modelId });
  }, []);

  // Foundation inputs
  const setWritingCodex = useCallback((text: string) => {
    dispatch({ type: 'SET_WRITING_CODEX', payload: text });
  }, []);

  const setPersonalConstitution = useCallback((text: string) => {
    dispatch({ type: 'SET_PERSONAL_CONSTITUTION', payload: text });
  }, []);

  // Answers
  const saveAnswer = useCallback((answer: WizardAnswer) => {
    const previousAnswer = stateRef.current.answers.find(a => a.questionId === answer.questionId);
    const answerChanged = !previousAnswer || previousAnswer.answer !== answer.answer;

    dispatch({ type: 'SAVE_ANSWER', payload: answer });

    // Fire background analysis if the answer actually changed
    if (answerChanged && answer.answer.trim().length > 0) {
      analyzeAnswerInBackground(answer);
    }
  }, [analyzeAnswerInBackground]);

  const getAnswer = useCallback((questionId: string) => {
    return stateRef.current.answers.find(a => a.questionId === questionId);
  }, []);

  // Wait for all in-flight background analyses to complete
  const waitForPendingInsights = useCallback(async () => {
    while (true) {
      const current = stateRef.current;
      const pending = current.analyzedInsights.filter(i => i.status === 'analyzing');
      if (pending.length === 0) break;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, []);

  // Build the generation request body using latest state from ref
  const buildGenerationBody = useCallback(() => {
    const current = stateRef.current;
    const completedInsights = current.analyzedInsights.filter(i => i.status === 'complete');

    // For answers: if insight exists, strip the raw answer text
    const lightAnswers = current.answers.map(a => {
      const hasInsight = completedInsights.some(i => i.questionId === a.questionId);
      if (hasInsight) {
        return { ...a, answer: '' };
      }
      return a;
    });

    return JSON.stringify({
      selectedModels: current.selectedModels,
      writingCodex: current.writingCodex,
      personalConstitution: current.personalConstitution,
      answers: lightAnswers,
      analyzedInsights: current.analyzedInsights,
    });
  }, []);

  // Stream the generation response from the API
  const performStreamingGeneration = useCallback(async () => {
    dispatch({ type: 'SET_GENERATION_PHASE', payload: 'generating' });

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: buildGenerationBody(),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Failed to generate instructions';
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
      } catch {
        if (response.status === 504 || response.status === 502) {
          errorMessage = 'Generation timed out. Click Try Again.';
        } else {
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
      }
      throw new Error(errorMessage);
    }

    // Start streaming
    dispatch({ type: 'SET_GENERATION_PHASE', payload: 'streaming' });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    let flushScheduled = false;

    const flushBuffer = () => {
      if (buffer) {
        dispatch({ type: 'APPEND_STREAMED_TEXT', payload: buffer });
        buffer = '';
      }
      flushScheduled = false;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      buffer += chunk;

      // Batch dispatches to avoid excessive re-renders
      if (!flushScheduled) {
        flushScheduled = true;
        setTimeout(flushBuffer, 80);
      }
    }

    // Flush any remaining buffer
    if (buffer) {
      dispatch({ type: 'APPEND_STREAMED_TEXT', payload: buffer });
    }

    return fullText;
  }, [buildGenerationBody]);

  // Main generation flow
  const generateInstructions = useCallback(async () => {
    dispatch({ type: 'START_GENERATING' });
    dispatch({ type: 'NEXT_STEP' });

    try {
      // Phase 1: Wait for any in-flight background analyses
      await waitForPendingInsights();

      // Phase 2: Stream the generation
      const rawText = await performStreamingGeneration();

      // Phase 3: Parse the streamed text as GenerationResult
      let result: GenerationResult;
      try {
        result = JSON.parse(rawText) as GenerationResult;
      } catch {
        throw new Error('Failed to parse generation result. Please try again.');
      }

      dispatch({ type: 'GENERATION_SUCCESS', payload: result });
    } catch (error) {
      dispatch({
        type: 'GENERATION_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [waitForPendingInsights, performStreamingGeneration]);

  // Retry generation without step change
  const retryGeneration = useCallback(async () => {
    dispatch({ type: 'START_GENERATING' });

    try {
      await waitForPendingInsights();
      const rawText = await performStreamingGeneration();

      let result: GenerationResult;
      try {
        result = JSON.parse(rawText) as GenerationResult;
      } catch {
        throw new Error('Failed to parse generation result. Please try again.');
      }

      dispatch({ type: 'GENERATION_SUCCESS', payload: result });
    } catch (error) {
      dispatch({
        type: 'GENERATION_ERROR',
        payload: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [waitForPendingInsights, performStreamingGeneration]);

  // Reset
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedState(null);
    dispatch({ type: 'RESET' });
  }, []);

  // Validation per step
  const canProceed = useCallback((): boolean => {
    // Step 0 (intro): always true
    if (state.currentStep === 0) return true;

    // Step 1 (model selection): at least one model selected
    if (state.currentStep === 1) return state.selectedModels.length > 0;

    // Step 2 (foundation): always true (both fields optional)
    if (state.currentStep === 2) return true;

    // Steps 3+ (questions): always true (all skippable)
    return true;
  }, [state.currentStep, state.selectedModels]);

  const value: WizardContextType = {
    state,
    toggleModel,
    setWritingCodex,
    setPersonalConstitution,
    goToStep,
    nextStep,
    prevStep,
    saveAnswer,
    getAnswer,
    generateInstructions,
    retryGeneration,
    hasSavedProgress,
    resumeProgress,
    clearSavedProgress,
    reset,
    canProceed,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

// Hook for using wizard context
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
