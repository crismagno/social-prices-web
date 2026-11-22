"use client";

import { useEffect, useState } from "react";

import { IStoreSiteHero } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { cssUrl } from "./site-format";

interface Props {
  hero: IStoreSiteHero;
  /** The template's own class for its background: size, position, movement. */
  className: string;
}

/** The backgrounds of the entrance, in the order they are shown. */
export const heroSlideKeys = (
  hero: Pick<IStoreSiteHero, "backgroundImageUrl" | "backgroundImageUrls">,
): string[] =>
  Array.from(
    new Set(
      [hero.backgroundImageUrl, ...(hero.backgroundImageUrls ?? [])]
        .map((key: string | null | undefined) => key?.trim() ?? "")
        .filter(Boolean),
    ),
  ).slice(0, StoreSitesEnum.MAX_HERO_EXTRA_IMAGES + 1);

const FADE_SECONDS = 1.4;

/**
 * The background of the entrance. With one image it is that image, as always;
 * with more, they take turns, each fading into the next. Every template draws
 * it with its own class, so the slider looks like part of each one.
 */
const HeroBackground = ({ hero, className }: Props) => {
  const slides: string[] = heroSlideKeys(hero);

  const [current, setCurrent] = useState<number>(0);

  const count: number = slides.length;

  const seconds: number = Math.min(
    StoreSitesEnum.MAX_SLIDE_SECONDS,
    Math.max(
      StoreSitesEnum.MIN_SLIDE_SECONDS,
      Number(hero.slideSeconds) || StoreSitesEnum.DEFAULT_SLIDE_SECONDS,
    ),
  );

  useEffect(() => {
    // An image was removed while a later one was showing.
    setCurrent((index: number) => (index < count ? index : 0));

    if (count < 2) {
      return;
    }

    // Someone who asked for less motion keeps the first image still.
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
    }, seconds * 1000);

    return () => window.clearInterval(timer);
  }, [count, seconds]);

  if (!count) {
    return null;
  }

  return (
    <>
      {slides.map((key: string, index: number) => (
        <div
          key={key}
          aria-hidden="true"
          className={className}
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

export default HeroBackground;
