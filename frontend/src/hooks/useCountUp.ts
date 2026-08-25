import { useEffect, useRef, useState } from 'react';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * شمارنده صعودی اعداد داشبورد — rAF + ease-out cubic (۵۰۰ms).
 * با prefers-reduced-motion بلافاصله مقدار نهایی نمایش داده می‌شود.
 * مبدأ انیمیشن «آخرین مقدار نمایش‌داده‌شده» است (نه ref از قبل از mount) —
 * بنابراین StrictMode (mount→cleanup→mount) انیمیشن را نمی‌کشد و تغییر target هم نرم است.
 */
export function useCountUp(target: number, duration = 500): number {
  const [value, setValue] = useState(prefersReduced ? target : 0);
  const shownRef = useRef(value);

  useEffect(() => {
    if (prefersReduced) {
      shownRef.current = target;
      setValue(target);
      return;
    }

    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const next = Math.round(from + (target - from) * eased);
      shownRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
