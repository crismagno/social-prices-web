"use client";

import { CSSProperties, ReactNode } from "react";

import { IStoreSiteBlock } from "../../../../shared/business/store-sites/store-site-blocks";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import styles from "./SectionHeight.module.css";

interface Props {
  section: IStoreSiteBlock;
  children: ReactNode;
}

/**
 * A section as tall as the owner pulled it. The entrance takes it as its own
 * height (every template reads `--sz-hero-h`), so it can be made shorter as
 * well; any other section is at least that tall, its content stretched to
 * fill it. A section with a height of its own (spacer, canvas, map) or none
 * set is drawn as it is.
 */
const SectionHeight = ({ section, children }: Props) => {
  const height: number | null = section.settings.boxHeight;

  if (height === null || !children) {
    return <>{children}</>;
  }

  if (section.type === StoreSitesEnum.BlockType.HERO) {
    return (
      <div
        className={styles.hero}
        style={{ "--sz-hero-h": `${height}px` } as CSSProperties}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={styles.box} style={{ minHeight: height }}>
      {children}
    </div>
  );
};

export default SectionHeight;
