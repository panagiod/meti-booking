"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionSegment {
  text: string;
  timestamp: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  language?: string;
  onSegment?: (segment: SpeechRecognitionSegment) => void;
  onTranscriptReady?: (fullTranscript: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  segments: SpeechRecognitionSegment[];
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Check browser support
function getSpeechRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SpeechRecognition || null;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { language = "en-US", onSegment, onTranscriptReady } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState<SpeechRecognitionSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  const start = useCallback(() => {
    if (!isSupported) {
      setError("Your browser does not support speech recognition. We recommend using Chrome.");
      return;
    }

    try {
      const SpeechRecognition = getSpeechRecognition();
      const recognition = new SpeechRecognition();

      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += text;
            const segment: SpeechRecognitionSegment = {
              text: text.trim(),
              timestamp: Date.now(),
              isFinal: true,
            };
            setSegments((prev) => [...prev, segment]);
            onSegment?.(segment);
          } else {
            interimTranscript += text;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => (prev + " " + finalTranscript).trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone permission denied.");
        } else if (event.error === "no-speech") {
          // Silence, not an error
        } else {
          setError(`Recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Restart if it should still be listening
        if (recognitionRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError("Error starting speech recognition.");
    }
  }, [isSupported, language, onSegment]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    onTranscriptReady?.(transcript);
  }, [transcript, onTranscriptReady]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    segments,
    start,
    stop,
    error,
  };
}
