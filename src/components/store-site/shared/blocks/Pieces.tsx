"use client";

import {
  IStoreSiteBlockButton,
  IStoreSiteBlockItem,
} from "../../../../shared/business/store-sites/store-site-blocks";
import { isKnownPlayer } from "../../../../shared/business/store-sites/store-site-about";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import SiteButton from "./SiteButton";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

/** A row of up to three buttons. */
export const PieceButtons = ({ block, step, context }: IBlockProps) => (
  <div className={styles.buttonRow}>
    {block.buttons.map((button: IStoreSiteBlockButton, index: number) => (
      <SiteButton
        key={index}
        button={button}
        context={context}
        className={styles.item}
        style={step(index)}
      />
    ))}
  </div>
);

/** One picture, framed the template's way, with its caption. */
export const PieceImage = ({ block, step }: IBlockProps) => {
  const image: IStoreSiteBlockItem | undefined = block.items[0];

  if (!image?.imageUrl) {
    return null;
  }

  return (
    <figure className={`${styles.picture} ${styles.item}`} style={step(0)}>
      <div className={styles.pictureFrame} data-shine>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getImageUrl(image.imageUrl)} alt={image.text ?? ""} loading="lazy" />
      </div>
      {image.text && <figcaption>{image.text}</figcaption>}
    </figure>
  );
};

/** An uploaded video, or a YouTube/Vimeo player this site embeds. */
export const PieceVideo = ({ block, step }: IBlockProps) => {
  const media = block.settings.media;

  if (!media) {
    return null;
  }

  return (
    <div className={`${styles.videoFrame} ${styles.item}`} style={step(0)}>
      {media.type === StoreSitesEnum.AboutMediaType.EMBED ? (
        isKnownPlayer(media.url) && (
          <iframe
            src={media.url}
            title={block.title ?? "video"}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )
      ) : (
        <video
          src={getImageUrl(media.url)}
          controls
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
};

/** Empty space, as tall as the owner chose. */
export const PieceSpacer = ({ block }: IBlockProps) => (
  <div
    className={styles.spacer}
    style={{ height: block.settings.height ?? 48 }}
    aria-hidden
  />
);

/** A line, dots or a wave in the site's colour, drawn as it scrolls in. */
export const PieceDivider = ({ block, step }: IBlockProps) => {
  const style: StoreSitesEnum.DividerStyle =
    block.settings.divider ?? StoreSitesEnum.DividerStyle.LINE;

  return (
    <div
      className={`${styles.divider} ${styles.item}`}
      data-divider={style}
      style={step(0)}
      aria-hidden
    >
      {style === StoreSitesEnum.DividerStyle.WAVE ? (
        <svg viewBox="0 0 240 24" preserveAspectRatio="none">
          <path d="M0 12 Q 15 0 30 12 T 60 12 T 90 12 T 120 12 T 150 12 T 180 12 T 210 12 T 240 12" />
        </svg>
      ) : (
        <span />
      )}
    </div>
  );
};

/** One to three columns side by side: a picture, a title, words, a button. */
export const PieceBox = ({ block, step, context }: IBlockProps) => (
  <div
    className={styles.box}
    style={{ "--box-columns": block.items.length } as React.CSSProperties}
  >
    {block.items.map((column: IStoreSiteBlockItem, index: number) => (
      <article
        key={column.key}
        className={`${styles.boxColumn} ${styles.item}`}
        style={step(index)}
      >
        {column.imageUrl && (
          <div className={styles.boxImage} data-shine>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getImageUrl(column.imageUrl)} alt="" loading="lazy" />
          </div>
        )}
        {column.title && <h3 className={styles.itemTitle}>{column.title}</h3>}
        {column.text && <p className={styles.itemText}>{column.text}</p>}
        {column.button && (
          <SiteButton button={column.button} context={context} />
        )}
      </article>
    ))}
  </div>
);
