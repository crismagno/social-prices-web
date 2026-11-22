"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/**
 * "static": drawn as it is — what the server sends, so the page is complete
 * without JavaScript. "waiting": below the fold, hidden until scrolled to.
 * "shown": scrolled into view, animating in.
 */
export type TRevealPhase = "static" | "waiting" | "shown";

const useReveal = <T extends HTMLElement>(): {
  ref: RefObject<T>;
  phase: TRevealPhase;
} => {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<TRevealPhase>("static");

  useEffect(() => {
    const element: T | null = ref.current;

    const prefersReducedMotion: boolean =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      !element ||
      prefersReducedMotion ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    // Already on screen when the page loads: it stays as the server drew it.
    if (element.getBoundingClientRect().top < window.innerHeight) {
      return;
    }

    setPhase("waiting");

    const observer: IntersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (
          entries.some(
            (entry: IntersectionObserverEntry) => entry.isIntersecting,
          )
        ) {
          setPhase("shown");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, phase };
};

export default useReveal;
