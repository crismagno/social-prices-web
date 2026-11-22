"use client";

import { CSSProperties, ReactNode } from "react";

import {
  IStoreSiteAbout,
  isKnownPlayer,
  siteAboutOf,
} from "../../../shared/business/store-sites/store-site-about";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import styles from "./SiteAbout.module.css";
import useReveal from "./useReveal";

/** The look of the section: each template's own. */
export type TSiteAboutVariant =
  "atelier" | "garden" | "studio" | "aurora" | "impact";

interface Props {
  about: Partial<IStoreSiteAbout> | null | undefined;
  /** The store's own description: the words shown when the owner wrote none. */
  storeAbout: string | null;
  /** The template's own title, shown when the owner gave none. */
  defaultTitle: string;
  /** A small line above the title. */
  kicker?: string;
  variant: TSiteAboutVariant;
  /** The template's letters for the title. */
  titleClassName?: string;
  /** On a page whose top already says the title. */
  isTitleHidden?: boolean;
}

/** The words of the section: the owner's, else the store's own description. */
const textsOf = (
  about: IStoreSiteAbout,
  storeAbout: string | null,
): string[] => {
  const own: string[] = about.texts
    .map((text: string) => text.trim())
    .filter(Boolean);

  return own.length ? own : storeAbout?.trim() ? [storeAbout.trim()] : [];
};

/** Whether a site shows an about section at all: what the menus link to. */
export const siteHasAbout = (
  about: Partial<IStoreSiteAbout> | null | undefined,
  storeAbout: string | null,
): boolean => {
  const checked: IStoreSiteAbout = siteAboutOf(about);

  return (
    checked.isActive &&
    (textsOf(checked, storeAbout).length > 0 || !!checked.media)
  );
};

// Words centered when there is no picture beside them, in the templates that
// center their texts.
const CENTERED: TSiteAboutVariant[] = ["atelier", "garden", "aurora"];

/**
 * The "about" of the site, drawn the way each template draws everything else:
 * a title, the owner's paragraphs, and an image, an uploaded video or a
 * YouTube/Vimeo player. Its parts come in one after the other when it scrolls
 * into view.
 */
const SiteAbout = ({
  about,
  storeAbout,
  defaultTitle,
  kicker,
  variant,
  titleClassName,
  isTitleHidden,
}: Props) => {
  const { ref, phase } = useReveal<HTMLElement>();

  const checked: IStoreSiteAbout = siteAboutOf(about);

  if (!siteHasAbout(about, storeAbout)) {
    return null;
  }

  const texts: string[] = textsOf(checked, storeAbout);

  const { media } = checked;

  let mediaNode: ReactNode = null;

  if (media?.type === StoreSitesEnum.AboutMediaType.IMAGE) {
    // eslint-disable-next-line @next/next/no-img-element
    mediaNode = <img src={getImageUrl(media.url)} alt="" loading="lazy" />;
  } else if (media?.type === StoreSitesEnum.AboutMediaType.VIDEO) {
    mediaNode = (
      <video
        src={getImageUrl(media.url)}
        controls
        playsInline
        preload="metadata"
      />
    );
  } else if (
    media?.type === StoreSitesEnum.AboutMediaType.EMBED &&
    // Only a player this site embeds, whatever was stored.
    isKnownPlayer(media.url)
  ) {
    mediaNode = (
      <iframe
        src={media.url}
        title={checked.title ?? defaultTitle}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  const position: StoreSitesEnum.AboutMediaPosition = checked.mediaPosition;

  const layout: string = !mediaNode
    ? styles.alone
    : position === StoreSitesEnum.AboutMediaPosition.RIGHT
      ? styles.right
      : position === StoreSitesEnum.AboutMediaPosition.TOP
        ? styles.top
        : styles.left;

  const isCentered: boolean =
    CENTERED.includes(variant) &&
    (!mediaNode || position === StoreSitesEnum.AboutMediaPosition.TOP);

  // The order things come in: the picture, then the words, line by line.
  let order: number = 0;

  const step = (): CSSProperties => ({ "--i": order++ }) as CSSProperties;

  return (
    <section
      ref={ref}
      id="sobre"
      data-phase={phase}
      className={`${styles.about} ${styles[variant]}`}
    >
      <div
        className={`${styles.layout} ${layout} ${isCentered ? styles.center : ""}`}
      >
        {mediaNode && (
          <div className={`${styles.media} ${styles.item}`} style={step()}>
            <span className={styles.deco} aria-hidden="true" />
            <div
              className={styles.frame}
              style={
                {
                  "--about-ratio":
                    media?.type === StoreSitesEnum.AboutMediaType.IMAGE
                      ? "4 / 3"
                      : "16 / 9",
                } as CSSProperties
              }
            >
              {mediaNode}
            </div>
          </div>
        )}
        <div className={styles.body}>
          {kicker && (
            <p className={`${styles.kicker} ${styles.item}`} style={step()}>
              {kicker}
            </p>
          )}
          {!isTitleHidden && (
            <div className={`${styles.titleBox} ${styles.item}`} style={step()}>
              <h2 className={`${styles.title} ${titleClassName ?? ""}`}>
                {checked.title ?? defaultTitle}
              </h2>
            </div>
          )}
          {texts.map((text: string, index: number) => (
            <p
              key={index}
              className={`${styles.text} ${styles.item}`}
              style={step()}
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SiteAbout;
