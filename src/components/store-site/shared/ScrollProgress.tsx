"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** The main color of the site (#rrggbb). */
  color: string;
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** A thin line at the very top that fills as the visitor reads down the page. */
const ScrollProgress = ({ color }: Props) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number = 0;

    const update = (): void => {
      frame = 0;

      const scrollable: number =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress: number =
        scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    // At most once a frame, however fast the page scrolls.
    const onScroll = (): void => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 60,
        transform: "scaleX(0)",
        transformOrigin: "left center",
        background: HEX_COLOR.test(color) ? color : "#6b7a5e",
        pointerEvents: "none",
      }}
    />
  );
};

export default ScrollProgress;
