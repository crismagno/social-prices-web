"use client";

import { CSSProperties, ReactNode } from "react";

import {
  IStoreSiteMarqueeStyle,
  siteMarqueeStyleOf,
} from "../../../../shared/business/store-sites/store-site-marquee-style";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import styles from "./MarqueeStyle.module.css";

interface Props {
  style: Partial<IStoreSiteMarqueeStyle> | null | undefined;
  children: ReactNode;
}

/**
 * The owner's choices over the template's strip of phrases: speed, direction,
 * size, colours and a pause under the pointer. It takes no room: it only
 * speaks to the strip inside it, whatever template drew it.
 */
const MarqueeStyle = ({ style, children }: Props) => {
  const chosen: IStoreSiteMarqueeStyle = siteMarqueeStyleOf(style);

  return (
    <div
      className={styles.wrap}
      data-speed={chosen.speed}
      data-direction={chosen.direction}
      data-size={chosen.size}
      data-pause={chosen.pauseOnHover || undefined}
      data-bg={chosen.background ? "" : undefined}
      data-color={chosen.color ? "" : undefined}
      style={
        {
          "--mq-bg": chosen.background ?? undefined,
          "--mq-color": chosen.color ?? undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
};

export const isMarqueeStyled = (
  style: Partial<IStoreSiteMarqueeStyle> | null | undefined,
): boolean => {
  const chosen: IStoreSiteMarqueeStyle = siteMarqueeStyleOf(style);

  return (
    chosen.speed !== StoreSitesEnum.MarqueeSpeed.NORMAL ||
    chosen.direction !== StoreSitesEnum.MarqueeDirection.LEFT ||
    chosen.size !== StoreSitesEnum.MarqueeSize.MEDIUM ||
    !!chosen.background ||
    !!chosen.color ||
    chosen.pauseOnHover
  );
};

export default MarqueeStyle;
