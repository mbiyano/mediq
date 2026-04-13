import { useCallback, useRef } from 'react';

interface AudioOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const CHIME_FREQUENCY = 880;
const CHIME_DURATION = 0.3;

export function useAudio(options: AudioOptions = {}) {
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = useCallback(() => {
    return new Promise<void>((resolve) => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(CHIME_FREQUENCY, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + CHIME_DURATION);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + CHIME_DURATION);

        oscillator.onended = () => resolve();
      } catch {
        resolve();
      }
    });
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const synth = synthRef.current;
      if (!synth) return;

      // Play chime first
      await playChime();

      // Short pause between chime and voice
      await new Promise((r) => setTimeout(r, 300));

      return new Promise<void>((resolve) => {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang ?? 'es-AR';
        utterance.rate = options.rate ?? 0.9;
        utterance.pitch = options.pitch ?? 1;
        utterance.volume = options.volume ?? 1;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        synth.speak(utterance);
      });
    },
    [playChime, options.lang, options.rate, options.pitch, options.volume],
  );

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return { speak, playChime, isSupported };
}
