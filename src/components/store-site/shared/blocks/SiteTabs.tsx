"use client";

import { Fragment, ReactNode, useEffect, useRef, useState } from "react";

import { IStoreSiteBlock } from "../../../../shared/business/store-sites/store-site-blocks";
import { ITabsEntry } from "../../../../shared/business/store-sites/store-site-layout";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import useSiteT from "../useSiteT";
import styles from "./SiteTabs.module.css";

interface Props {
  block: IStoreSiteBlock;
  /** The items that have a name and sections of this page to show. */
  entries: ITabsEntry[];
  /** Draws one section of an item; absent in the builder. */
  draw?: (section: IStoreSiteBlock) => ReactNode;
}

/**
 * A menu whose items each show other sections of the page. The owner
 * chooses how it is laid (tabs in a row on top, or a menu down the side) and
 * what it does: show only the chosen section, or draw them all and scroll to
 * the chosen one. On a narrow screen the items are a list to pick from. In
 * the builder only the menu is drawn: its sections stay on the page, where
 * they are edited.
 */
const SiteTabs = ({ block, entries, draw }: Props) => {
  const t = useSiteT();

  const [chosenKey, setChosenKey] = useState<string | null>(null);

  // Which way the last pick went, so a section slides in from that side.
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Scrolling: the sections that came on screen, each coming in once. Nothing
  // waits hidden until the page is alive here, so it reads without scripts.
  const [isAlive, setIsAlive] = useState<boolean>(false);
  const [seenKeys, setSeenKeys] = useState<string[]>([]);

  const panelsRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);

  // Floating: the button shows only while the menu itself is out of sight,
  // and its list is open only while the visitor is choosing.
  const [isMenuOnScreen, setIsMenuOnScreen] = useState<boolean>(true);
  const [isFloatOpen, setIsFloatOpen] = useState<boolean>(false);

  const isFloating: boolean =
    block.settings.menuPlace === StoreSitesEnum.MenuPlace.FLOATING && !!draw;

  useEffect(() => {
    const menu: HTMLElement | null = menuRef.current;

    if (!isFloating || !menu) {
      return;
    }

    const observer: IntersectionObserver = new IntersectionObserver(
      ([seen]: IntersectionObserverEntry[]) => {
        setIsMenuOnScreen(seen.isIntersecting);

        if (seen.isIntersecting) {
          setIsFloatOpen(false);
        }
      },
    );

    observer.observe(menu);

    return () => observer.disconnect();
  }, [isFloating]);

  // The open list closes on Escape and on a click anywhere else.
  useEffect(() => {
    if (!isFloatOpen) {
      return;
    }

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsFloatOpen(false);
      }
    };

    const onDown = (event: MouseEvent): void => {
      if (!floatRef.current?.contains(event.target as Node)) {
        setIsFloatOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [isFloatOpen]);

  const isScroll: boolean =
    block.settings.menuMode === StoreSitesEnum.MenuMode.SCROLL;

  const isSide: boolean =
    block.settings.menuStyle === StoreSitesEnum.MenuStyle.SIDE;

  const keys: string = entries.map((entry: ITabsEntry) => entry.key).join(",");

  // Scrolling: the item of the section on screen is the one marked.
  useEffect(() => {
    const panels: HTMLDivElement | null = panelsRef.current;

    if (!isScroll || !draw || !panels) {
      return;
    }

    const observer: IntersectionObserver = new IntersectionObserver(
      (seen: IntersectionObserverEntry[]) => {
        const onScreen: IntersectionObserverEntry | undefined = seen.find(
          (each: IntersectionObserverEntry) => each.isIntersecting,
        );

        if (onScreen) {
          setChosenKey((onScreen.target as HTMLElement).dataset.tab ?? null);
        }
      },
      // A band across the upper part of the screen: what crosses it is "here".
      { rootMargin: "-25% 0px -65% 0px" },
    );

    // Coming on screen at all: the section comes in, once.
    const arrivals: IntersectionObserver = new IntersectionObserver(
      (seen: IntersectionObserverEntry[]) => {
        const arrived: string[] = seen
          .filter((each: IntersectionObserverEntry) => each.isIntersecting)
          .map((each) => (each.target as HTMLElement).dataset.tab ?? "");

        if (arrived.length) {
          setSeenKeys((current: string[]) =>
            Array.from(new Set([...current, ...arrived])),
          );
        }
      },
      { threshold: 0.08 },
    );

    panels.querySelectorAll("[data-tab]").forEach((panel: Element) => {
      observer.observe(panel);
      arrivals.observe(panel);
    });

    setIsAlive(true);

    return () => {
      observer.disconnect();
      arrivals.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScroll, keys]);

  if (!entries.length) {
    return null;
  }

  // The first item until the visitor picks one, or if the picked one is gone.
  const chosen: ITabsEntry =
    entries.find((entry: ITabsEntry) => entry.key === chosenKey) ?? entries[0];

  const indexOf = (key: string): number =>
    entries.findIndex((entry: ITabsEntry) => entry.key === key);

  const pick = (key: string): void => {
    setDirection(indexOf(key) < indexOf(chosen.key) ? "back" : "forward");
    setChosenKey(key);

    if (isScroll) {
      panelsRef.current
        ?.querySelector(`[data-tab="${key}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Picked from the floating button: the new section starts where the old
  // one did, not wherever the visitor had scrolled to in it.
  const pickFloating = (key: string): void => {
    setIsFloatOpen(false);
    pick(key);

    if (!isScroll) {
      panelsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const label: string = block.title ?? t("storeSite.blocks.tabsLabel");

  return (
    <div
      className={styles.wrap}
      data-style={isSide ? "side" : "tabs"}
      data-mode={isScroll ? "scroll" : "switch"}
      data-side={block.settings.menuSide ?? undefined}
      data-look={block.settings.menuLook ?? undefined}
      data-align={block.settings.align ?? undefined}
      data-tone={block.settings.tone ?? undefined}
      data-effect={block.settings.menuEffect ?? undefined}
      data-place={block.settings.menuPlace ?? undefined}
      data-direction={direction}
      data-alive={isAlive || undefined}
      data-builder={!draw || undefined}
    >
      <section ref={menuRef} className={styles.menu} data-type={block.type}>
        {block.title && <h2 className={styles.title}>{block.title}</h2>}

        <div className={styles.list} role="tablist" aria-label={label}>
          {entries.map((entry: ITabsEntry) => (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={entry.key === chosen.key}
              className={styles.tab}
              onClick={() => pick(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <select
          className={styles.select}
          aria-label={label}
          value={chosen.key}
          onChange={(event) => pick(event.target.value)}
        >
          {entries.map((entry: ITabsEntry) => (
            <option key={entry.key} value={entry.key}>
              {entry.label}
            </option>
          ))}
        </select>

        {!draw && (
          <p className={styles.note}>
            {t("storeSite.editor.builder.frame.tabsNote")}
          </p>
        )}
      </section>

      {draw && (
        <div ref={panelsRef} className={styles.panels}>
          {(isScroll ? entries : [chosen]).map((entry: ITabsEntry) => (
            // One at a time: a new panel for each item, so its sections
            // come in as they do on a page.
            <div
              key={entry.key}
              role="tabpanel"
              data-tab={entry.key}
              // Only what the visitor picked comes in, not what the page
              // opens with.
              data-enter={(!isScroll && chosenKey !== null) || undefined}
              data-seen={seenKeys.includes(entry.key) || undefined}
              className={styles.panel}
            >
              {entry.sections.map((section: IStoreSiteBlock) => (
                <Fragment key={section.key}>{draw(section)}</Fragment>
              ))}
            </div>
          ))}
        </div>
      )}

      {isFloating && (
        // Last in the menu's own stretch of the page: it rides the bottom of
        // the screen only while that stretch is on it, and takes no room.
        <div
          ref={floatRef}
          className={styles.float}
          data-shown={!isMenuOnScreen || undefined}
        >
          <div className={styles.floatBox}>
            {isFloatOpen && (
              <div className={styles.floatList} role="menu" aria-label={label}>
                {entries.map((entry: ITabsEntry) => (
                  <button
                    key={entry.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={entry.key === chosen.key}
                    className={styles.floatItem}
                    onClick={() => pickFloating(entry.key)}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className={styles.floatButton}
              aria-haspopup="menu"
              aria-expanded={isFloatOpen}
              aria-label={t(
                isFloatOpen
                  ? "storeSite.blocks.tabsClose"
                  : "storeSite.blocks.tabsOpen",
              )}
              // Out of sight: not reached with the keyboard either.
              tabIndex={isMenuOnScreen ? -1 : 0}
              onClick={() => setIsFloatOpen((open: boolean) => !open)}
            >
              <span className={styles.floatBars} aria-hidden />
              <span className={styles.floatLabel}>{chosen.label}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteTabs;
