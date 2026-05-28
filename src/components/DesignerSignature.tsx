import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*+=?/<>[]{}';
const BASE_DELAY_MIN = 1800;
const BASE_DELAY_SPREAD = 2600;

interface DesignerSignatureProps {
  text?: string;
  className?: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function DesignerSignature({ text = 'DESIGNED BY NOT SERIOUS', className }: DesignerSignatureProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const sourceChars = useMemo(() => [...text], [text]);
  const mutablePositions = useMemo(
    () =>
      sourceChars
        .map((char, index) => ({ char, index }))
        .filter((item) => item.char !== ' ')
        .map((item) => item.index),
    [sourceChars],
  );

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    if (reducedMotion || mutablePositions.length < 3) {
      setDisplayText(text);
      setIsGlitching(false);
      return;
    }

    const clearTimers = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const runBurst = () => {
      const shuffled = [...mutablePositions].sort(() => Math.random() - 0.5);
      const changedCount = Math.min(shuffled.length, randomInt(3, 7));
      const positions = shuffled.slice(0, changedCount).sort((a, b) => a - b);
      const holdFrames = randomInt(2, 4);
      const totalFrames = randomInt(16, 23);
      let frame = 0;

      setIsGlitching(true);
      intervalRef.current = window.setInterval(() => {
        frame += 1;
        const settleProgress = Math.max(0, frame - holdFrames) / Math.max(1, totalFrames - holdFrames);
        const settledCount = Math.floor(settleProgress * positions.length);
        const nextChars = [...sourceChars];

        positions.forEach((position, index) => {
          if (index < settledCount) return;
          const randomGlyph = GLYPHS[randomInt(0, GLYPHS.length - 1)];
          const noiseStrength = Math.max(0.22, 0.86 - settleProgress * 0.58);
          nextChars[position] = Math.random() < noiseStrength ? randomGlyph : sourceChars[position];
        });

        setDisplayText(nextChars.join(''));

        if (frame >= totalFrames) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setDisplayText(text);
          setIsGlitching(false);
        }
      }, 34);
    };

    const scheduleBurst = (initial = false) => {
      const delay = initial ? randomInt(900, 1800) : BASE_DELAY_MIN + Math.random() * BASE_DELAY_SPREAD;
      timeoutRef.current = window.setTimeout(() => {
        runBurst();
        scheduleBurst();
      }, delay);
    };

    scheduleBurst(true);

    return clearTimers;
  }, [mutablePositions, reducedMotion, sourceChars, text]);

  return (
    <span
      className={cn('designer-signature', isGlitching && 'is-glitching', className)}
      data-text={displayText}
      aria-label={text}
    >
      <span className="designer-signature__text">{displayText}</span>
    </span>
  );
}
