"use client";

import {
  CSSProperties,
  ComponentType,
  DragEvent,
  Fragment,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
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
import { CanvasBuilderContext, ICanvasBuilder } from "./canvas-builder";
import PieceCanvas from "./PieceCanvas";
import PieceForm from "./PieceForm";
import PieceMap from "./PieceMap";
import SectionBackground from "./SectionBackground";
import SectionHeight from "./SectionHeight";
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
import {
  hasNativeHeight,
  sectionHeightOf,
  withSectionHeight,
} from "../../../../shared/business/store-sites/store-site-section-height";
import { CANVAS_LIMITS } from "../../../../shared/business/store-sites/store-site-canvas";

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
  [StoreSitesEnum.BlockType.CANVAS]: PieceCanvas,
  [StoreSitesEnum.BlockType.MAP]: PieceMap,
  [StoreSitesEnum.BlockType.FORM]: PieceForm,
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
  // The section being dragged by its handle; none for a new piece.
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  // A drag of a section or a piece is over the page.
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  // The section whose bottom edge is being pulled, at the height it would
  // have now: drawn so at once, told to the editor when the pointer lets go.
  const [pulled, setPulled] = useState<{
    key: string;
    height: number;
  } | null>(null);

  // A pull of a section's edge, as a height of its own kind: a canvas counts
  // its height in its own pixels (1200 across), everything else on screen.
  const resize =
    (section: IStoreSiteBlock) =>
    (
      pull: { dy: number; startHeight: number; startWidth: number },
      isDone: boolean,
    ): void => {
      const isCanvas: boolean =
        section.type === StoreSitesEnum.BlockType.CANVAS;
      const perPixel: number =
        isCanvas && pull.startWidth > 0
          ? CANVAS_LIMITS.width / pull.startWidth
          : 1;

      // A height of its own starts from itself (the section around it may be
      // taller, with a title); any other from how tall it is seen, which is
      // never less than what it shows.
      const start: number = hasNativeHeight(section.type)
        ? (sectionHeightOf(section) ?? pull.startHeight * perPixel)
        : pull.startHeight;

      const height: number =
        sectionHeightOf(
          withSectionHeight(section, start + pull.dy * perPixel),
        ) ?? start;

      if (!isDone) {
        setPulled({ key: section.key, height });

        return;
      }

      setPulled(null);

      // A click on the edge without a pull changes nothing.
      if (pull.dy !== 0) {
        builder.send({ kind: "resize", key: section.key, height });
      }
    };

  const draggingIndex: number = draggingKey
    ? sections.findIndex(
        (section: IStoreSiteBlock) => section.key === draggingKey,
      )
    : -1;

  // Only a place that changes something: right before or after the section
  // being moved it would stay where it is.
  const aim = (at: number | null): void =>
    setDropIndex(
      at !== null &&
        draggingIndex >= 0 &&
        (at === draggingIndex || at === draggingIndex + 1)
        ? null
        : at,
    );

  // While something is dragged over the page: the page scrolls by itself near
  // its top and bottom edges, so any place can be reached, and every trace of
  // the drag goes when it ends, wherever it ends.
  useEffect(() => {
    const EDGE: number = 90;
    const MAX_STEP: number = 22;
    let speed: number = 0;
    let frame: number = 0;

    const tick = (): void => {
      if (speed !== 0) {
        window.scrollBy(0, speed);
      }

      frame = window.requestAnimationFrame(tick);
    };

    const onOver = (event: globalThis.DragEvent): void => {
      if (!event.dataTransfer?.types.includes(SECTION_DRAG_TYPE)) {
        return;
      }

      setIsDragOver(true);

      const fromTop: number = event.clientY;
      const fromBottom: number = window.innerHeight - event.clientY;

      speed =
        fromTop < EDGE
          ? -Math.ceil(((EDGE - fromTop) / EDGE) * MAX_STEP)
          : fromBottom < EDGE
            ? Math.ceil(((EDGE - fromBottom) / EDGE) * MAX_STEP)
            : 0;
    };

    const finish = (): void => {
      speed = 0;
      setIsDragOver(false);
      setDropIndex(null);
      setDraggingKey(null);
    };

    // Leaving the page (back to the editor): it stops scrolling.
    const onLeave = (event: globalThis.DragEvent): void => {
      // Told by where the pointer is: some browsers leave `relatedTarget`
      // empty between two elements of the page too.
      const isOut: boolean =
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight;

      if (isOut) {
        speed = 0;
        setIsDragOver(false);
        setDropIndex(null);
      }
    };

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", finish);
    window.addEventListener("dragend", finish);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", finish);
      window.removeEventListener("dragend", finish);
    };
  }, []);

  const drop = (event: DragEvent<HTMLElement>, at: number | null): void => {
    const data: TSectionDrag | null = dragOf(event);

    event.preventDefault();
    event.stopPropagation();
    setDropIndex(null);
    setDraggingKey(null);
    setIsDragOver(false);

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

  // The gap between two sections takes the drop too: it is where the page
  // says to let go.
  const line = (at: number): ReactNode => (
    <div
      className={frameStyles.dropLine}
      data-open={dropIndex === at || undefined}
      aria-hidden
      onDragOver={(event: DragEvent<HTMLDivElement>) => {
        if (
          dropIndex === at &&
          event.dataTransfer.types.includes(SECTION_DRAG_TYPE)
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onDrop={(event) => drop(event, at)}
    >
      <span className={frameStyles.dropPill}>
        {t("storeSite.editor.builder.frame.dropHere")}
      </span>
    </div>
  );

  // A free canvas is worked on right here: what is done to its elements
  // goes to the editor like everything else.
  const canvasBuilder: ICanvasBuilder = useMemo(
    () => ({
      selectedElementKey: builder.selectedElementKey ?? null,
      select: (key: string, elementKey: string | null) =>
        builder.send({ kind: "selectElement", key, elementKey }),
      place: (key, elementKey, box) =>
        builder.send({ kind: "placeElement", key, elementKey, box }),
    }),
    [builder],
  );

  const placeholder = (section: IStoreSiteBlock): ReactNode => (
    <div className={frameStyles.placeholder}>
      <strong>{builder.labelOf(section.type)}</strong>
      <span>{t("storeSite.editor.builder.frame.empty")}</span>
    </div>
  );

  return (
    <CanvasBuilderContext.Provider value={canvasBuilder}>
      <div
        className={frameStyles.page}
        data-drag-over={isDragOver || undefined}
        onDragLeave={(event: DragEvent<HTMLDivElement>) => {
          // Out of the page altogether: no line.
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setDropIndex(null);
          }
        }}
      >
        {sections.map((section: IStoreSiteBlock, index: number) => {
          const isPart: boolean = isPartType(section.type);
          // While its edge is pulled, drawn at the height it is pulled to.
          const sized: IStoreSiteBlock =
            pulled?.key === section.key
              ? withSectionHeight(section, pulled.height)
              : section;
          const shown: IStoreSiteBlock | null = isPart
            ? sized
            : showableSection(sized);

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
                ? drawPart(sized, renderPart, marqueeStyle)
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
                onDragOverAt={aim}
                onDragStartMove={() => setDraggingKey(section.key)}
                onDrop={(event) => drop(event, dropIndex)}
                onResize={resize(section)}
                onResizeReset={() =>
                  builder.send({
                    kind: "resize",
                    key: section.key,
                    height: null,
                  })
                }
                resizeLabel={
                  pulled?.key === section.key
                    ? section.type === StoreSitesEnum.BlockType.CANVAS
                      ? `${pulled.height}`
                      : `${pulled.height}px`
                    : null
                }
              >
                {content ? (
                  <SectionHeight section={sized}>
                    <SectionBackground background={section.settings.background}>
                      {content}
                    </SectionBackground>
                  </SectionHeight>
                ) : (
                  placeholder(section)
                )}
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
              aim(sections.length);
            }
          }}
          onDrop={(event) => drop(event, sections.length)}
        >
          {t("storeSite.editor.builder.frame.dragHere")}
        </div>
      </div>
    </CanvasBuilderContext.Provider>
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

  // Each section over the background the owner gave it, when it has one.
  const draw = (section: IStoreSiteBlock): ReactNode => (
    <SectionHeight section={section}>
      <SectionBackground background={section.settings.background}>
        {isPartType(section.type) ? (
          drawPart(section, renderPart, marqueeStyle)
        ) : (
          <BlockSection block={section} {...rest} />
        )}
      </SectionBackground>
    </SectionHeight>
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
