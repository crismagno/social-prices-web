"use client";

import { useEffect, useRef } from "react";

import styles from "./SiteProductSearch.module.css";
import useSiteT from "./useSiteT";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/**
 * The search box over the products, in the colors of the site: a wide card
 * with the lens in the site's color, lifted while it is in use. "/" puts the
 * cursor in it from anywhere on the page.
 */
const SiteProductSearch = ({ value, onChange }: Props) => {
  const t = useSiteT();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      const isTyping: boolean =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.search} role="search">
      <label className={styles.field}>
        <span className={styles.lens} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          className={styles.input}
          value={value}
          placeholder={t("storeSite.public.searchProducts")}
          aria-label={t("storeSite.public.searchProducts")}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onChange("");
              event.currentTarget.blur();
            }
          }}
        />
        {value ? (
          <button
            type="button"
            className={styles.clear}
            aria-label={t("storeSite.public.clearSearch")}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : (
          <kbd className={styles.hint} aria-hidden="true">
            /
          </kbd>
        )}
      </label>
    </div>
  );
};

export default SiteProductSearch;
