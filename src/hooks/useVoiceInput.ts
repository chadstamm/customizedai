'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputOptions {
  onTranscript?: (transcript: string) => void;
  onInterimTranscript?: (transcript: string) => void;
  continuous?: boolean;
  language?: string;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

// Define SpeechRecognition types for browsers that support it
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onspeechstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onTranscript,
    continuous = true,
    language = 'en-US'
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);

  // Keep refs updated
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition once
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);

    if (!SpeechRecognitionClass) {
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onaudiostart = () => {
      console.log('Audio capture started');
    };

    recognition.onspeechstart = () => {
      console.log('Speech detected');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('Got result:', event.results);
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      console.log('Final:', finalTranscript, 'Interim:', interim);

      if (finalTranscript) {
        // Call the callback with just the new transcript
        onTranscriptRef.current?.(finalTranscript);
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      console.log('Recognition ended, isListening:', isListeningRef.current);
      // Restart if we're still supposed to be listening (continuous mode)
      if (isListeningRef.current && continuous) {
        try {
          console.log('Restarting recognition');
          recognition.start();
        } catch (e) {
          console.warn('Could not restart:', e);
        }
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    setError(null);
    setInterimTranscript('');

    try {
      console.log('Starting recognition');
      recognitionRef.current.start();
      setIsListening(true);
      isListeningRef.current = true;
    } catch (e) {
      console.warn('Recognition start error:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log('Stopping recognition');
    if (recognitionRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    error
  };
}
