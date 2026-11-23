"use client";

import { useEffect, useRef, useState } from "react";

import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";
import { INumberParts, formatLike, splitNumber } from "./countUp";

const COUNT_MS = 1400;

/**
 * A number that counts up the first time it is seen, in the owner's own
 * format, and always ends as they typed it.
 */
const CountUp = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<string>(value);

  useEffect(() => {
    const element: HTMLSpanElement | null = ref.current;
    const parts: INumberParts | null = splitNumber(value);

    const reduced: boolean =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setShown(value);

    if (
      !element ||
      !parts ||
      reduced ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let frame: number = 0;

    const run = (): void => {
      const start: number = performance.now();

      const tick = (now: number): void => {
        const progress: number = Math.min(1, (now - start) / COUNT_MS);
        // Fast at first, gently into place.
        const eased: number = 1 - Math.pow(1 - progress, 3);

        setShown(
          progress < 1 ? formatLike(parts, parts.value * eased) : value,
        );

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const observer: IntersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={styles.statValue}>
      {shown}
    </span>
  );
};

/** Big numbers of the company, each with what it counts. */
const BlockStats = ({ block, step }: IBlockProps) => (
  <div className={styles.stats}>
    {block.items.map((item: IStoreSiteBlockItem, index: number) => (
      <div key={item.key} className={`${styles.stat} ${styles.item}`} style={step(index)}>
        {item.title && <CountUp value={item.title} />}
        {item.subtitle && <span className={styles.statLabel}>{item.subtitle}</span>}
      </div>
    ))}
  </div>
);

export default BlockStats;
