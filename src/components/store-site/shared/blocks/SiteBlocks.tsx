"use client";

import { CSSProperties, ComponentType, MouseEvent } from "react";

import { ArrowRightOutlined } from "@ant-design/icons";

import {
  IStoreSiteBlock,
  blockButtonHref,
  blocksForPage,
} from "../../../../shared/business/store-sites/store-site-blocks";
import { IStoreSitePage } from "../../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { TSiteAboutVariant } from "../SiteAbout";
import useReveal from "../useReveal";
import useSiteT from "../useSiteT";
import BlockFaq from "./BlockFaq";
import BlockFeatures from "./BlockFeatures";
import BlockLogos from "./BlockLogos";
import BlockStats from "./BlockStats";
import BlockSteps from "./BlockSteps";
import BlockTeam from "./BlockTeam";
import BlockTestimonials from "./BlockTestimonials";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

interface Props {
  blocks: unknown;
  pages: IStoreSitePage[] | null | undefined;
  siteSlug: string;
  /** The page shown; null is the home. */
  pageKey: string | null;
  variant: TSiteAboutVariant;
  mode: "live" | "preview";
}

const ITEMS_OF: Record<
  Exclude<StoreSitesEnum.BlockType, StoreSitesEnum.BlockType.CTA>,
  ComponentType<IBlockProps>
> = {
  [StoreSitesEnum.BlockType.TEAM]: BlockTeam,
  [StoreSitesEnum.BlockType.TESTIMONIALS]: BlockTestimonials,
  [StoreSitesEnum.BlockType.LOGOS]: BlockLogos,
  [StoreSitesEnum.BlockType.FEATURES]: BlockFeatures,
  [StoreSitesEnum.BlockType.FAQ]: BlockFaq,
  [StoreSitesEnum.BlockType.STATS]: BlockStats,
  [StoreSitesEnum.BlockType.STEPS]: BlockSteps,
};

interface IBlockSectionProps extends Omit<Props, "blocks" | "pageKey"> {
  block: IStoreSiteBlock;
}

/**
 * One block: its heading, then its items, coming in one after the other when
 * it scrolls into view; a call to action is a banner with its button.
 */
const BlockSection = ({
  block,
  pages,
  siteSlug,
  variant,
  mode,
}: IBlockSectionProps) => {
  const t = useSiteT();
  const { ref, phase } = useReveal<HTMLElement>();

  // The order the parts come in, fixed while drawing so the server and the
  // browser agree: the heading's lines, then the items (or the button).
  const headingLines: number = [block.kicker, block.title, block.subtitle].filter(
    Boolean,
  ).length;

  const turn = (index: number): CSSProperties =>
    ({ "--i": index }) as CSSProperties;

  const step = (index: number): CSSProperties => turn(headingLines + index);

  let line: number = 0;

  const headingTurn = (): CSSProperties => turn(line++);

  const isCta: boolean = block.type === StoreSitesEnum.BlockType.CTA;
  const Items = isCta
    ? null
    : ITEMS_OF[block.type as Exclude<StoreSitesEnum.BlockType, StoreSitesEnum.BlockType.CTA>];

  const href: string | null = isCta
    ? blockButtonHref(block.button, siteSlug, pages)
    : null;

  const isExternal: boolean = !!href && /^https?:/.test(href);

  const heading = (
    <header className={styles.heading}>
      {block.kicker && (
        <p className={`${styles.kicker} ${styles.item}`} style={headingTurn()}>
          {block.kicker}
        </p>
      )}
      {block.title && (
        <h2 className={`${styles.title} ${styles.item}`} style={headingTurn()}>
          {block.title}
        </h2>
      )}
      {block.subtitle && (
        <p className={`${styles.subtitle} ${styles.item}`} style={headingTurn()}>
          {block.subtitle}
        </p>
      )}
    </header>
  );

  return (
    <section
      ref={ref}
      data-phase={phase}
      data-type={block.type}
      className={`${styles.block} ${styles[variant]} ${isCta ? styles.cta : ""}`}
    >
      {isCta ? (
        <div className={`${styles.ctaBox} ${styles.item}`} style={turn(0)}>
          <span className={styles.ctaGlow} aria-hidden />
          {heading}
          {href !== null && (
            <a
              className={`${styles.ctaButton} ${styles.item}`}
              style={step(0)}
              href={href}
              data-shine
              {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                // The editor's preview never leaves the editor.
                if (mode === "preview") {
                  event.preventDefault();
                }
              }}
            >
              {block.button?.label ?? t("storeSite.blocks.ctaButton")}
              <ArrowRightOutlined />
            </a>
          )}
        </div>
      ) : (
        <>
          {heading}
          {Items && <Items block={block} step={step} />}
        </>
      )}
    </section>
  );
};

/**
 * The blocks the owner added to this page (null is the home), in their
 * order, each in the look of the template.
 */
const SiteBlocks = ({ blocks, pageKey, ...rest }: Props) => {
  const shown: IStoreSiteBlock[] = blocksForPage(blocks, pageKey, rest.pages);

  if (!shown.length) {
    return null;
  }

  return (
    <div className={styles.blocks}>
      {shown.map((block: IStoreSiteBlock) => (
        <BlockSection key={block.key} block={block} {...rest} />
      ))}
    </div>
  );
};

export default SiteBlocks;
