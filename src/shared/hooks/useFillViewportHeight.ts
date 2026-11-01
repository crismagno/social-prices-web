"use client";

import { RefObject, useLayoutEffect, useRef, useState } from "react";

// The page's own padding under the content (the main area has 1.75rem all around).
const PAGE_BOTTOM_PADDING: number = 28;

// The height that takes the rest of the screen, down to the bottom, for the
// element that gets `ref`: what is left under where it starts, following the
// window being resized. Never smaller than `minHeight`.
export const useFillViewportHeight = (
  minHeight: number,
): { ref: RefObject<HTMLDivElement>; height: number } => {
  const ref = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<number>(minHeight);

  useLayoutEffect(() => {
    const fit = (): void => {
      const top: number = ref.current?.getBoundingClientRect().top ?? 0;

      setHeight(
        Math.max(minHeight, window.innerHeight - top - PAGE_BOTTOM_PADDING),
      );
    };

    fit();

    window.addEventListener("resize", fit);

    return () => window.removeEventListener("resize", fit);
  }, [minHeight]);

  return { ref, height };
};
