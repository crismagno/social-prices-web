"use client";

import { RefCallback, useLayoutEffect, useState } from "react";

// The page's own padding under the content (the main area has 1.75rem all around).
const PAGE_BOTTOM_PADDING: number = 28;

// The height that takes the rest of the screen, down to the bottom, for the
// element that gets `ref`: what is left under where it starts, following the
// window being resized. Never smaller than `minHeight`.
export const useFillViewportHeight = (
  minHeight: number,
): { ref: RefCallback<HTMLDivElement>; height: number } => {
  // Kept in state, not in a ref object: the element may mount after this hook
  // (the layout holds the page back while the session loads), and the height
  // has to be measured again once it is there.
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const [height, setHeight] = useState<number>(minHeight);

  useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const fit = (): void => {
      // Where the element starts in the page, whatever the current scroll.
      const top: number = element.getBoundingClientRect().top + window.scrollY;

      // The element's own borders are outside the height it hands out.
      const borders: number = element.offsetHeight - element.clientHeight;

      setHeight(
        Math.max(
          minHeight,
          window.innerHeight - top - borders - PAGE_BOTTOM_PADDING,
        ),
      );
    };

    fit();

    window.addEventListener("resize", fit);

    return () => window.removeEventListener("resize", fit);
  }, [element, minHeight]);

  return { ref: setElement, height };
};
