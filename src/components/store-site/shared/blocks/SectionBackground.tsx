"use client";

import { CSSProperties, ReactNode } from "react";

import { IStoreSiteSectionBackground } from "../../../../shared/business/store-sites/store-site-section-background";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { cssUrl } from "../site-format";
import styles from "./SectionBackground.module.css";

interface Props {
  background: IStoreSiteSectionBackground | null | undefined;
  children: ReactNode;
}

const Type = StoreSitesEnum.SectionBackgroundType;

/** The most of a section's height each faded edge takes, in percent. */
const MAX_FADE_SHARE: number = 45;

// What the layer is painted with: nothing for a kind that lacks what it needs.
const paintOf = (background: IStoreSiteSectionBackground): string | null => {
  const first: string = background.color ?? "var(--site-primary)";
  const second: string = background.color2 ?? "var(--site-secondary)";

  switch (background.type) {
    case Type.COLOR:
      return background.color ?? "var(--site-accent)";
    case Type.GRADIENT:
      return background.isAnimated
        ? `linear-gradient(${background.angle}deg, ${first}, ${second}, ${first})`
        : `linear-gradient(${background.angle}deg, ${first}, ${second})`;
    case Type.IMAGE:
      return background.imageUrl
        ? `${cssUrl(background.imageUrl)} center / cover no-repeat`
        : null;
    default:
      return null;
  }
};

/**
 * A section over the background the owner gave it: a colour, a gradient or an
 * image, as solid and as faded at its top and bottom as chosen, with the room
 * asked for above and below. A section with none is drawn as it is, with
 * nothing around it.
 */
const SectionBackground = ({ background, children }: Props) => {
  // Nothing to show is not a section to frame.
  if (!background || !children) {
    return <>{children}</>;
  }

  const paint: string | null = paintOf(background);

  const edge: number = (background.fade / 100) * MAX_FADE_SHARE;

  const mask: string | undefined =
    background.fade > 0
      ? `linear-gradient(to bottom, transparent 0%, #000 ${edge}%, #000 ${
          100 - edge
        }%, transparent 100%)`
      : undefined;

  const isImage: boolean = background.type === Type.IMAGE;

  return (
    <div
      className={styles.wrap}
      data-panel={background.isWide ? undefined : ""}
      style={{
        paddingTop: background.spaceTop ?? undefined,
        paddingBottom: background.spaceBottom ?? undefined,
      }}
    >
      {paint && (
        <div
          className={styles.layer}
          data-animated={
            background.type === Type.GRADIENT && background.isAnimated
              ? ""
              : undefined
          }
          aria-hidden="true"
          style={
            {
              background: paint,
              opacity: background.opacity / 100,
              maskImage: mask,
              WebkitMaskImage: mask,
              ...(isImage && background.blur > 0
                ? { filter: `blur(${background.blur}px)` }
                : {}),
            } as CSSProperties
          }
        />
      )}
      {children}
    </div>
  );
};

export default SectionBackground;
