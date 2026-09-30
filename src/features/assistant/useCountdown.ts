import { useEffect, useRef, useState } from 'react';

/** 125 → "02:05" */
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Tek bir mutfak zamanlayıcısı; bitince onFinish çağrılır */
export function useCountdown(onFinish: () => void) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) {
        setEndsAt(null);
        onFinishRef.current();
      }
    }, 500);
    return () => clearInterval(id);
  }, [endsAt]);

  const start = (minutes: number) => {
    const t = Date.now();
    setNow(t);
    setEndsAt(t + minutes * 60_000);
  };

  const cancel = () => setEndsAt(null);
  const remainingSeconds = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

  return { running: endsAt !== null, remainingSeconds, start, cancel };
}
