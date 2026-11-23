"use client";

import { useEffect, useRef, useState } from "react";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import useSiteT from "../useSiteT";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

const SLIDE_MS = 5000;
const GRID_UP_TO = 3;

const Stars = ({ rating }: { rating: number }) => {
  const t = useSiteT();

  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={t("storeSite.blocks.rating", { count: rating })}
    >
      {[1, 2, 3, 4, 5].map((star: number) => (
        <span key={star} className={star <= rating ? styles.starOn : ""}>
          ★
        </span>
      ))}
    </span>
  );
};

const Quote = ({ item }: { item: IStoreSiteBlockItem }) => (
  <figure className={`${styles.card} ${styles.quote}`} data-shine>
    <Stars rating={item.rating ?? 5} />
    <blockquote className={styles.quoteText}>{item.text}</blockquote>
    <figcaption className={styles.author}>
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.avatar}
          src={getImageUrl(item.imageUrl)}
          alt=""
          loading="lazy"
        />
      )}
      <span>
        {item.title && <strong>{item.title}</strong>}
        {item.subtitle && <small>{item.subtitle}</small>}
      </span>
    </figcaption>
  </figure>
);

/**
 * What customers say. Up to three side by side; more slide by themselves,
 * stop while the visitor's pointer is on them, and have arrows.
 */
const BlockTestimonials = ({ block, step }: IBlockProps) => {
  const t = useSiteT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const isCarousel: boolean = block.items.length > GRID_UP_TO;

  const move = (direction: 1 | -1): void => {
    const track: HTMLDivElement | null = trackRef.current;

    if (!track) {
      return;
    }

    const card: Element | null = track.firstElementChild;
    const width: number = card ? card.getBoundingClientRect().width + 20 : 300;
    const atEnd: boolean =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

    if (direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * width, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const reduced: boolean =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isCarousel || isPaused || reduced) {
      return;
    }

    const timer: number = window.setInterval(() => move(1), SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [isCarousel, isPaused]);

  if (!isCarousel) {
    return (
      <div className={`${styles.grid} ${styles.quoteGrid}`}>
        {block.items.map((item: IStoreSiteBlockItem, index: number) => (
          <div key={item.key} className={styles.item} style={step(index)}>
            <Quote item={item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.carousel} ${styles.item}`}
      style={step(0)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div ref={trackRef} className={styles.track}>
        {block.items.map((item: IStoreSiteBlockItem) => (
          <div key={item.key} className={styles.slide}>
            <Quote item={item} />
          </div>
        ))}
      </div>
      <div className={styles.arrows}>
        <button
          type="button"
          aria-label={t("storeSite.blocks.previous")}
          onClick={() => move(-1)}
        >
          <LeftOutlined />
        </button>
        <button
          type="button"
          aria-label={t("storeSite.blocks.next")}
          onClick={() => move(1)}
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};

export default BlockTestimonials;
