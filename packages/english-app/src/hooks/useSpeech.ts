import { useState, useCallback } from 'react';

interface UseSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const { language = 'en-US', rate = 1, pitch = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speak = useCallback(
    (text: string) => {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [language, rate, pitch],
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(
    (
      onResult: (transcript: string) => void,
      onError?: (error: string) => void,
    ) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        onError?.('Speech Recognition not supported');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError?.(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    },
    [language],
  );

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const isSupported = () => {
    return (
      'speechSynthesis' in window &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  };

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    isSupported,
  };
};
