"use client";

import {
  CSSProperties,
  ComponentType,
  DragEvent,
  Fragment,
  MouseEvent,
  ReactNode,
  useState,
} from "react";

import { ArrowRightOutlined } from "@ant-design/icons";

import {
  IStoreSiteBlock,
  blockButtonHref,
  isPartType,
  showableSection,
} from "../../../../shared/business/store-sites/store-site-blocks";
import { IStoreSiteMarqueeStyle } from "../../../../shared/business/store-sites/store-site-marquee-style";
import {
  ITabsEntry,
  TPartType,
  tabsLayoutOf,
} from "../../../../shared/business/store-sites/store-site-layout";
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
import MarqueeStyle from "./MarqueeStyle";
import SectionFrame from "./SectionFrame";
import SiteTabs from "./SiteTabs";
import frameStyles from "./SectionFrame.module.css";
import styles from "./SiteBlocks.module.css";
import {
  ISectionBuilderHooks,
  SECTION_DRAG_TYPE,
  TSectionDrag,
} from "./builder-types";
import {
  PieceBox,
  PieceButtons,
  PieceDivider,
  PieceImage,
  PieceSpacer,
  PieceVideo,
} from "./Pieces";
import PieceCards, { hasOwnCardsLayout } from "./PieceCards";
import { IBlockContext, IBlockProps } from "./blockTypes";

interface Props {
  /** The sections of the page shown, in order (see visiblePageSections). */
  sections: IStoreSiteBlock[];
  /**
   * How the template draws its own parts: the products, the about... A strip
   * or cards are drawn with the content of the section given.
   */
  renderPart: (type: TPartType, section: IStoreSiteBlock) => ReactNode;
  pages: IStoreSitePage[] | null | undefined;
  siteSlug: string;
  variant: TSiteAboutVariant;
  mode: "live" | "preview";
  /** The editor's builder: sections are framed, picked and dropped. */
  builder?: ISectionBuilderHooks;
  /** The owner's choices for the strip of phrases. */
  marqueeStyle?: Partial<IStoreSiteMarqueeStyle> | null;
}

/** The kinds of section drawn by a component of their own (not a part, not a CTA). */
export const SECTION_COMPONENTS: Partial<
  Record<StoreSitesEnum.BlockType, ComponentType<IBlockProps>>
> = {
  [StoreSitesEnum.BlockType.TEAM]: BlockTeam,
  [StoreSitesEnum.BlockType.BUTTONS]: PieceButtons,
  [StoreSitesEnum.BlockType.IMAGE]: PieceImage,
  [StoreSitesEnum.BlockType.VIDEO]: PieceVideo,
  [StoreSitesEnum.BlockType.SPACER]: PieceSpacer,
  [StoreSitesEnum.BlockType.DIVIDER]: PieceDivider,
  [StoreSitesEnum.BlockType.BOX]: PieceBox,
  [StoreSitesEnum.BlockType.TESTIMONIALS]: BlockTestimonials,
  [StoreSitesEnum.BlockType.LOGOS]: BlockLogos,
  [StoreSitesEnum.BlockType.FEATURES]: BlockFeatures,
  [StoreSitesEnum.BlockType.FAQ]: BlockFaq,
  [StoreSitesEnum.BlockType.STATS]: BlockStats,
  [StoreSitesEnum.BlockType.STEPS]: BlockSteps,
};

interface IBlockSectionProps extends Omit<
  Props,
  "sections" | "renderPart" | "builder" | "marqueeStyle"
> {
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
  const headingLines: number = [
    block.kicker,
    block.title,
    block.subtitle,
  ].filter(Boolean).length;

  const turn = (index: number): CSSProperties =>
    ({ "--i": index }) as CSSProperties;

  const step = (index: number): CSSProperties => turn(headingLines + index);

  let line: number = 0;

  const headingTurn = (): CSSProperties => turn(line++);

  const isCta: boolean = block.type === StoreSitesEnum.BlockType.CTA;
  const Items = isCta ? null : (SECTION_COMPONENTS[block.type] ?? null);

  const href: string | null = isCta
    ? blockButtonHref(block.button, siteSlug, pages)
    : null;

  const isExternal: boolean = !!href && /^https?:/.test(href);

  const context: IBlockContext = { siteSlug, pages, mode };

  const { settings } = block;

  // A spacer or a divider is only itself: no heading, no room around it.
  const isBare: boolean =
    block.type === StoreSitesEnum.BlockType.SPACER ||
    block.type === StoreSitesEnum.BlockType.DIVIDER;

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
        <p
          className={`${styles.subtitle} ${styles.item}`}
          style={headingTurn()}
        >
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
      data-align={settings.align ?? undefined}
      data-tone={settings.tone ?? undefined}
      data-width={settings.width ?? undefined}
      className={`${styles.block} ${styles[variant]} ${isCta ? styles.cta : ""} ${
        isBare ? styles.bare : ""
      }`}
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
          {!isBare && headingLines > 0 && heading}
          {Items && <Items block={block} step={step} context={context} />}
        </>
      )}
    </section>
  );
};

/**
 * A part of the template. A strip of phrases gets the owner's choices on it:
 * its own once it has content of its own, else the site's.
 */
const drawPart = (
  section: IStoreSiteBlock,
  renderPart: (type: TPartType, section: IStoreSiteBlock) => ReactNode,
  marqueeStyle: Partial<IStoreSiteMarqueeStyle> | null | undefined,
): ReactNode => {
  const type = section.type as TPartType;

  // Cards the owner laid out are the same in every template.
  if (hasOwnCardsLayout(section)) {
    return <PieceCards block={section} />;
  }

  return type === StoreSitesEnum.BlockType.MARQUEE ? (
    <MarqueeStyle
      style={
        section.settings.isOwn === true
          ? section.settings.marquee
          : marqueeStyle
      }
    >
      {renderPart(type, section)}
    </MarqueeStyle>
  ) : (
    renderPart(type, section)
  );
};

/** What a dragged thing is, read when it is dropped. */
const dragOf = (event: DragEvent<HTMLElement>): TSectionDrag | null => {
  try {
    return JSON.parse(event.dataTransfer.getData(SECTION_DRAG_TYPE));
  } catch {
    return null;
  }
};

/**
 * The page in the editor's builder: every section framed (hidden and empty
 * ones too, so they can be reached), a line where a drag would land, and a
 * place at the end of the page to drop new pieces.
 */
const BuilderSections = ({
  sections,
  renderPart,
  builder,
  marqueeStyle,
  ...rest
}: Props & { builder: ISectionBuilderHooks }) => {
  const t = useSiteT();
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const drop = (event: DragEvent<HTMLElement>, at: number | null): void => {
    const data: TSectionDrag | null = dragOf(event);

    event.preventDefault();
    setDropIndex(null);

    if (!data || at === null) {
      return;
    }

    if (data.kind === "new") {
      builder.send({ kind: "insert", type: data.type, atIndex: at });

      return;
    }

    const from: number = sections.findIndex(
      (section: IStoreSiteBlock) => section.key === data.key,
    );

    // Counted without the section being moved.
    const toIndex: number = from >= 0 && from < at ? at - 1 : at;

    if (from >= 0 && toIndex !== from) {
      builder.send({ kind: "move", key: data.key, toIndex });
    }
  };

  const line = (at: number): ReactNode => (
    <div
      className={frameStyles.dropLine}
      data-open={dropIndex === at || undefined}
      aria-hidden
    >
      <span className={frameStyles.dropPill}>
        {t("storeSite.editor.builder.frame.dropHere")}
      </span>
    </div>
  );

  const placeholder = (section: IStoreSiteBlock): ReactNode => (
    <div className={frameStyles.placeholder}>
      <strong>{builder.labelOf(section.type)}</strong>
      <span>{t("storeSite.editor.builder.frame.empty")}</span>
    </div>
  );

  return (
    <div
      onDragLeave={(event: DragEvent<HTMLDivElement>) => {
        // Out of the page altogether: no line.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDropIndex(null);
        }
      }}
    >
      {sections.map((section: IStoreSiteBlock, index: number) => {
        const isPart: boolean = isPartType(section.type);
        const shown: IStoreSiteBlock | null = isPart
          ? section
          : showableSection(section);

        // A menu of tabs is only its menu here: its sections stay on the
        // page, where they are picked and edited.
        const tabs: ITabsEntry[] =
          section.type === StoreSitesEnum.BlockType.TABS
            ? section.items
                .filter((item) => !!item.title?.trim())
                .map((item) => ({
                  key: item.key,
                  label: item.title?.trim() ?? "",
                  sections: [],
                }))
            : [];

        const content: ReactNode =
          section.type === StoreSitesEnum.BlockType.TABS
            ? tabs.length > 0 && <SiteTabs block={section} entries={tabs} />
            : isPart
              ? drawPart(section, renderPart, marqueeStyle)
              : shown && <BlockSection block={shown} {...rest} />;

        return (
          <Fragment key={section.key}>
            {line(index)}
            <SectionFrame
              section={section}
              index={index}
              count={sections.length}
              isPart={isPart}
              builder={builder}
              onDragOverAt={setDropIndex}
              onDrop={(event) => drop(event, dropIndex)}
            >
              {content || placeholder(section)}
            </SectionFrame>
          </Fragment>
        );
      })}
      {sections.length > 0 && line(sections.length)}
      <div
        className={frameStyles.dropEnd}
        data-empty={sections.length === 0 || undefined}
        data-open={dropIndex === sections.length || undefined}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          if (event.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
            event.preventDefault();
            setDropIndex(sections.length);
          }
        }}
        onDrop={(event) => drop(event, sections.length)}
      >
        {t("storeSite.editor.builder.frame.dragHere")}
      </div>
    </div>
  );
};

/**
 * A page between its top and its footer: the sections in the order the owner
 * put them. The template draws its own parts; everything else is drawn here,
 * in the template's look.
 */
const SiteSections = ({
  sections,
  renderPart,
  builder,
  marqueeStyle,
  ...rest
}: Props) => {
  if (builder) {
    return (
      <BuilderSections
        sections={sections}
        renderPart={renderPart}
        builder={builder}
        marqueeStyle={marqueeStyle}
        {...rest}
      />
    );
  }

  const draw = (section: IStoreSiteBlock): ReactNode =>
    isPartType(section.type) ? (
      drawPart(section, renderPart, marqueeStyle)
    ) : (
      <BlockSection block={section} {...rest} />
    );

  // A section a menu of tabs shows is drawn inside that menu only.
  const { taken, entriesOf } = tabsLayoutOf(sections);

  return (
    <>
      {sections
        .filter((section: IStoreSiteBlock) => !taken.has(section.key))
        .map((section: IStoreSiteBlock) =>
          section.type === StoreSitesEnum.BlockType.TABS ? (
            <SiteTabs
              key={section.key}
              block={section}
              entries={entriesOf(section.key)}
              draw={draw}
            />
          ) : (
            <Fragment key={section.key}>{draw(section)}</Fragment>
          ),
        )}
    </>
  );
};

export default SiteSections;
