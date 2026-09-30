import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';

const OPTIONS: Speech.SpeechOptions = { language: 'tr-TR', rate: 0.95 };

/** Asistanın sesli konuşması; konuşurken dinlemeyi durdurmak için speaking bilgisini verir */
export function useSpeaker() {
  const [speaking, setSpeaking] = useState(false);

  useEffect(
    () => () => {
      Speech.stop();
    },
    [],
  );

  const say = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      ...OPTIONS,
      onStart: () => setSpeaking(true),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const stop = () => {
    Speech.stop();
    setSpeaking(false);
  };

  return { speaking, say, stop };
}
