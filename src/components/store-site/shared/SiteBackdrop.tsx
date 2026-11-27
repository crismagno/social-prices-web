"use client";

import { CSSProperties, useEffect, useState } from "react";

import { IStoreSiteBackdrop } from "../../../shared/business/store-sites/store-site-backdrop";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImageSlides from "./ImageSlides";
import styles from "./SiteBackdrop.module.css";
import { cssUrl } from "./site-format";

interface Props {
  backdrop: IStoreSiteBackdrop;
  /** The colour of the site (or of the page): the veil over the backdrop. */
  color: string;
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// A phone gets the image that stands for the video: no data spent on it.
const WIDE_SCREEN = "(min-width: 721px)";
const LESS_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * What lies behind the whole site: images that take turns or a video, held to
 * the screen while the page scrolls over it, under a veil of the site's
 * colour so the words stay readable. It is only looked at: nothing in it can
 * be clicked or read.
 */
const SiteBackdrop = ({ backdrop, color }: Props) => {
  const isVideo: boolean = backdrop.type === StoreSitesEnum.BackdropType.VIDEO;

  // Decided in the browser: the server draws the image, which is always right.
  const [playsVideo, setPlaysVideo] = useState<boolean>(false);

  useEffect(() => {
    const canPlay = (): boolean =>
      typeof window.matchMedia === "function" &&
      window.matchMedia(WIDE_SCREEN).matches &&
      !window.matchMedia(LESS_MOTION).matches;

    const decide = (): void => setPlaysVideo(canPlay());

    decide();
    window.addEventListener("resize", decide);

    return () => window.removeEventListener("resize", decide);
  }, []);

  return (
    <div
      className={styles.backdrop}
      aria-hidden="true"
      data-blur={backdrop.blur}
      data-animated={backdrop.isAnimated || undefined}
    >
      <div className={styles.media}>
        {isVideo ? (
          <>
            {backdrop.posterUrl && (
              <div
                className={styles.layer}
                style={{ backgroundImage: cssUrl(backdrop.posterUrl) }}
              />
            )}
            {backdrop.videoUrl && playsVideo && (
              <video
                key={backdrop.videoUrl}
                className={styles.video}
                src={getImageUrl(backdrop.videoUrl)}
                poster={
                  backdrop.posterUrl
                    ? getImageUrl(backdrop.posterUrl)
                    : undefined
                }
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                preload="auto"
              />
            )}
          </>
        ) : (
          <ImageSlides
            keys={backdrop.imageUrls}
            seconds={backdrop.slideSeconds}
            className={styles.layer}
          />
        )}
      </div>
      <div
        className={styles.veil}
        style={
          {
            background: HEX_COLOR.test(color) ? color : "#ffffff",
            opacity: backdrop.veil / 100,
          } as CSSProperties
        }
      />
    </div>
  );
};

export default SiteBackdrop;
