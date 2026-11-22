"use client";

import { CSSProperties, ReactNode } from "react";

import {
  IStoreSiteAbout,
  isKnownPlayer,
  siteAboutOf,
} from "../../../shared/business/store-sites/store-site-about";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import Reveal from "./Reveal";
import styles from "./SiteAbout.module.css";

interface Props {
  about: Partial<IStoreSiteAbout> | null | undefined;
  /** The store's own description: the words shown when the owner wrote none. */
  storeAbout: string | null;
  /** The template's own title, shown when the owner gave none. */
  defaultTitle: string;
  /** A small line above the title, in templates that have one. */
  kicker?: string;
  /** The template's letters for the title. */
  titleClassName?: string;
  /** Without media: words centered, as in the template's own about. */
  align?: "center" | "left";
  /** A block of the main color around it (Studio). */
  isCard?: boolean;
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

/**
 * The "about" of the site, the same in every template: a title, the owner's
 * paragraphs, and an image, an uploaded video or a YouTube/Vimeo player.
 */
const SiteAbout = ({
  about,
  storeAbout,
  defaultTitle,
  kicker,
  titleClassName,
  align = "center",
  isCard,
}: Props) => {
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

  const layout: string = !mediaNode
    ? styles.alone
    : checked.mediaPosition === StoreSitesEnum.AboutMediaPosition.RIGHT
      ? styles.right
      : checked.mediaPosition === StoreSitesEnum.AboutMediaPosition.TOP
        ? styles.top
        : styles.left;

  const isCentered: boolean =
    align === "center" &&
    (!mediaNode ||
      checked.mediaPosition === StoreSitesEnum.AboutMediaPosition.TOP);

  return (
    <Reveal>
      <section id="sobre" className={styles.about}>
        <div
          className={`${styles.layout} ${layout} ${isCentered ? styles.center : ""} ${
            isCard ? styles.card : ""
          }`}
        >
          {mediaNode && (
            <div className={styles.media}>
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
            {kicker && <p className={styles.kicker}>{kicker}</p>}
            <h2 className={`${styles.title} ${titleClassName ?? ""}`}>
              {checked.title ?? defaultTitle}
            </h2>
            {texts.map((text: string, index: number) => (
              <p key={index} className={styles.text}>
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
};

export default SiteAbout;
