"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/**
 * The height left in the window below where the element starts, so a pane can
 * end at the bottom of the screen instead of making the page scroll.
 */
const useAvailableHeight = <T extends HTMLElement>(
  minimum: number = 360,
  bottomGap: number = 24,
): { ref: RefObject<T>; height: number } => {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number>(minimum);

  useEffect(() => {
    const measure = (): void => {
      const element: T | null = ref.current;

      if (!element) {
        return;
      }

      // Measured from the document, so it does not change while scrolling.
      const top: number = element.getBoundingClientRect().top + window.scrollY;

      setHeight(
        Math.max(minimum, Math.floor(window.innerHeight - top - bottomGap)),
      );
    };

    measure();

    window.addEventListener("resize", measure);

    // What sits above (alerts, tags) can appear or go and move the pane.
    const observer: ResizeObserver | null =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);

    observer?.observe(document.body);

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [minimum, bottomGap]);

  return { ref, height };
};

export default useAvailableHeight;
