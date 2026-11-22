"use client";

import { useEffect, useState } from "react";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import styles from "./ImageSlides.module.css";
import { cssUrl } from "./site-format";

interface Props {
  /** File keys of the images, in the order they are shown. */
  keys: string[];
  seconds: number | null | undefined;
  /**
   * The class of each image. Without one, each fills the element it is in,
   * taking its shape (that element must be positioned).
   */
  className?: string;
}

const FADE_SECONDS = 1.4;

/** First image and the extra ones, in order, without blanks or repeats. */
export const slideKeysOf = (
  first: string | null | undefined,
  extras: string[] | null | undefined,
): string[] =>
  Array.from(
    new Set(
      [first, ...(extras ?? [])]
        .map((key: string | null | undefined) => key?.trim() ?? "")
        .filter(Boolean),
    ),
  ).slice(0, StoreSitesEnum.MAX_HERO_EXTRA_IMAGES + 1);

/**
 * Images that take turns, each fading into the next. One image stays still.
 * Paused while the tab is hidden; someone who asked for less motion sees only
 * the first.
 */
const ImageSlides = ({ keys, seconds, className }: Props) => {
  const [current, setCurrent] = useState<number>(0);

  const count: number = keys.length;

  const interval: number = Math.min(
    StoreSitesEnum.MAX_SLIDE_SECONDS,
    Math.max(
      StoreSitesEnum.MIN_SLIDE_SECONDS,
      Number(seconds) || StoreSitesEnum.DEFAULT_SLIDE_SECONDS,
    ),
  );

  useEffect(() => {
    // An image was removed while a later one was showing.
    setCurrent((index: number) => (index < count ? index : 0));

    if (count < 2) {
      return;
    }

    const prefersReducedMotion: boolean =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCurrent(0);
      return;
    }

    const timer: number = window.setInterval(() => {
      // Not while the tab is hidden: it would jump several images on return.
      if (!document.hidden) {
        setCurrent((index: number) => (index + 1) % count);
      }
    }, interval * 1000);

    return () => window.clearInterval(timer);
  }, [count, interval]);

  return (
    <>
      {keys.map((key: string, index: number) => (
        <div
          key={key}
          aria-hidden="true"
          className={className ?? styles.layer}
          style={{
            backgroundImage: cssUrl(key),
            opacity: index === current ? 1 : 0,
            transition: `opacity ${FADE_SECONDS}s ease`,
          }}
        />
      ))}
    </>
  );
};

export default ImageSlides;
