import { useEffect, useRef, useState } from 'react';

import type { ListenState, SpeechRecognitionOptions } from './useSpeechRecognition';

// Tarayıcı Web Speech API'si için asgari tipler (TS lib'inde yok)
type RecognitionResultEvent = { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> };
type RecognitionErrorEvent = { error: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Sürekli dinleme: tarayıcı sessizlikte dinlemeyi kesince otomatik yeniden başlatır.
 * paused=true iken (örn. asistan konuşurken) kendi sesini komut sanmasın diye durur.
 */
export function useSpeechRecognition({ enabled, paused, onFinalText }: SpeechRecognitionOptions): ListenState {
  const [supported] = useState(() => getRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onTextRef = useRef(onFinalText);

  useEffect(() => {
    onTextRef.current = onFinalText;
  }, [onFinalText]);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !enabled || paused) return;

    let active = true;
    const recognition = new Ctor();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) onTextRef.current(result[0].transcript);
      }
    };
    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        active = false;
        setError('Mikrofon izni verilmedi. Tarayıcı ayarlarından Kukki için mikrofona izin ver.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Ses tanıma hatası', event.error);
      }
    };
    recognition.onend = () => {
      setListening(false);
      if (!active) return;
      // Sessizlik ya da tarayıcı sınırı nedeniyle kapandıysa yeniden dinle
      try {
        recognition.start();
      } catch (e) {
        console.warn('Dinleme yeniden başlatılamadı', e);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Dinleme başlatılamadı', e);
    }

    return () => {
      // onend yine çalışır: listening=false yapar ama yeniden başlatmaz
      active = false;
      recognition.stop();
    };
  }, [enabled, paused]);

  return { supported, listening, error };
}
