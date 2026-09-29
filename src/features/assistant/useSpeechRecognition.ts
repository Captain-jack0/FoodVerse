export type SpeechRecognitionOptions = {
  enabled: boolean;
  /** Asistan konuşurken dinlemeyi geçici durdurur */
  paused: boolean;
  onFinalText: (text: string) => void;
};

export type ListenState = { supported: boolean; listening: boolean; error: string | null };

/**
 * Mobil (native) sürüm: sesli komut için expo-speech-recognition + development build gerekir.
 * ponytail: şimdilik desteklenmiyor; web/Safari sürümü useSpeechRecognition.web.ts'de
 */
export function useSpeechRecognition(_options: SpeechRecognitionOptions): ListenState {
  return { supported: false, listening: false, error: null };
}
