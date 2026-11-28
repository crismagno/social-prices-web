"use client";

import {
  CSSProperties,
  PointerEvent,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";

import { isKnownPlayer } from "../../../../shared/business/store-sites/store-site-about";
import { blockButtonHref } from "../../../../shared/business/store-sites/store-site-blocks";
import {
  CANVAS_LIMITS,
  IStoreSiteCanvas,
  IStoreSiteCanvasElement,
  TCanvasBox,
  boxWithin,
} from "../../../../shared/business/store-sites/store-site-canvas";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import RichTextView from "../../../common/RichText/RichTextView";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import { cssUrl } from "../site-format";
import { readableOver } from "../SiteThemeVars";
import { IBlockProps } from "./blockTypes";
import { CanvasBuilderContext, ICanvasBuilder } from "./canvas-builder";
import styles from "./PieceCanvas.module.css";
import { MapView } from "./PieceMap";

const Type = StoreSitesEnum.CanvasElementType;

const W: number = CANVAS_LIMITS.width;

/** The grid an element snaps to while it is dragged, in canvas pixels. */
const SNAP: number = 4;

const snap = (value: number): number => Math.round(value / SNAP) * SNAP;

// A length of the canvas as a share of the canvas's own width, so it scales
// with the screen: 1200 canvas pixels are the whole width.
const scaled = (pixels: number): string => `calc(${pixels} / ${W} * 100cqw)`;

/** What a drag is doing to an element. */
type TGrip = "move" | "right" | "bottom" | "corner";

interface IDrag {
  key: string;
  grip: TGrip;
  /** Where the pointer was and the element's box when the drag began. */
  startX: number;
  startY: number;
  start: TCanvasBox;
  /** Canvas pixels per screen pixel, as the canvas is drawn now. */
  ratio: number;
  hasMoved: boolean;
}

const ALIGN: Record<StoreSitesEnum.CanvasAlign, CSSProperties["textAlign"]> = {
  [StoreSitesEnum.CanvasAlign.LEFT]: "left",
  [StoreSitesEnum.CanvasAlign.CENTER]: "center",
  [StoreSitesEnum.CanvasAlign.RIGHT]: "right",
};

const JUSTIFY: Record<StoreSitesEnum.CanvasAlign, string> = {
  [StoreSitesEnum.CanvasAlign.LEFT]: "flex-start",
  [StoreSitesEnum.CanvasAlign.CENTER]: "center",
  [StoreSitesEnum.CanvasAlign.RIGHT]: "flex-end",
};

/**
 * A free canvas: every element where the owner put it and as big as they made
 * it, one over the other in their order, the whole of it scaled to the width
 * of the screen. In the editor's builder an element is picked with a click,
 * moved by dragging it and resized by its edges, right in the preview.
 */
const PieceCanvas = ({ block, context }: IBlockProps) => {
  const builder: ICanvasBuilder | null = useContext(CanvasBuilderContext);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<IDrag | null>(null);

  // The box of the element being dragged, shown before the editor knows.
  const [live, setLive] = useState<{ key: string; box: TCanvasBox } | null>(
    null,
  );

  const canvas: IStoreSiteCanvas | null = block.settings.canvas;

  if (!canvas) {
    return null;
  }

  const { height, elements } = canvas;

  const boxOf = (element: IStoreSiteCanvasElement): TCanvasBox =>
    live?.key === element.key ? live.box : element;

  const begin = (
    event: PointerEvent<HTMLElement>,
    element: IStoreSiteCanvasElement,
    grip: TGrip,
  ): void => {
    if (!builder || !canvasRef.current || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // The handles and the element itself share the pointer until it lifts.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A pointer that cannot be held still drags while it stays over it.
    }

    builder.select(block.key, element.key);

    dragRef.current = {
      key: element.key,
      grip,
      startX: event.clientX,
      startY: event.clientY,
      start: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      },
      ratio: W / canvasRef.current.getBoundingClientRect().width,
      hasMoved: false,
    };
  };

  const boxAt = (drag: IDrag, event: PointerEvent<HTMLElement>): TCanvasBox => {
    const dx: number = (event.clientX - drag.startX) * drag.ratio;
    const dy: number = (event.clientY - drag.startY) * drag.ratio;

    const { start, grip } = drag;

    const next: TCanvasBox =
      grip === "move"
        ? { ...start, x: snap(start.x + dx), y: snap(start.y + dy) }
        : {
            ...start,
            // Never past the edges of the canvas from where it stands.
            width:
              grip === "bottom"
                ? start.width
                : Math.min(W - start.x, snap(start.width + dx)),
            height:
              grip === "right"
                ? start.height
                : Math.min(height - start.y, snap(start.height + dy)),
          };

    return boxWithin(next, height);
  };

  const move = (event: PointerEvent<HTMLElement>): void => {
    const drag: IDrag | null = dragRef.current;

    if (!drag) {
      return;
    }

    drag.hasMoved = true;
    setLive({ key: drag.key, box: boxAt(drag, event) });
  };

  const end = (event: PointerEvent<HTMLElement>): void => {
    const drag: IDrag | null = dragRef.current;

    dragRef.current = null;

    if (drag?.hasMoved && builder) {
      builder.place(block.key, drag.key, boxAt(drag, event));
    }

    setLive(null);
  };

  const contentOf = (element: IStoreSiteCanvasElement): ReactNode => {
    switch (element.type) {
      case Type.IMAGE:
        return element.imageUrl ? (
          <span
            className={styles.picture}
            style={{ backgroundImage: cssUrl(element.imageUrl) }}
          />
        ) : null;
      case Type.VIDEO:
        if (!element.media) {
          return null;
        }

        return element.media.type === StoreSitesEnum.AboutMediaType.EMBED ? (
          isKnownPlayer(element.media.url) && (
            <iframe
              className={styles.video}
              src={element.media.url}
              title="video"
              loading="lazy"
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )
        ) : (
          <video
            className={styles.video}
            src={getImageUrl(element.media.url)}
            controls
            playsInline
            preload="metadata"
          />
        );
      case Type.DIVIDER:
        return null;
      case Type.MAP:
        return <MapView map={element.map} isFill />;
      case Type.BUTTON:
        return element.text;
      default:
        // Written in the editor: its formatting is drawn, cleaned again.
        return element.text ? (
          <RichTextView className={styles.words} value={element.text} />
        ) : null;
    }
  };

  const styleOf = (element: IStoreSiteCanvasElement): CSSProperties => {
    const box: TCanvasBox = boxOf(element);

    const isButton: boolean = element.type === Type.BUTTON;
    const isDivider: boolean = element.type === Type.DIVIDER;

    // A button with no colour of its own takes the site's main one; a
    // divider is a line of its colour.
    const background: string | undefined = isDivider
      ? (element.color ?? "currentColor")
      : (element.background ?? (isButton ? "var(--site-primary)" : undefined));

    const color: string | undefined =
      element.color ??
      (isButton
        ? element.background
          ? readableOver(element.background)
          : "var(--site-on-primary, #fff)"
        : undefined);

    return {
      left: `${(box.x / W) * 100}%`,
      top: `${(box.y / height) * 100}%`,
      width: `${(box.width / W) * 100}%`,
      height: `${(box.height / height) * 100}%`,
      fontSize: scaled(element.fontSize),
      fontWeight: element.isBold ? 700 : 400,
      textAlign: ALIGN[element.align],
      justifyContent: JUSTIFY[element.align],
      color: isDivider ? undefined : color,
      background,
      borderRadius: scaled(element.radius),
      opacity: element.opacity / 100,
      ...(element.borderWidth > 0
        ? {
            border: `${scaled(element.borderWidth)} solid ${
              element.borderColor ?? "currentColor"
            }`,
          }
        : {}),
    };
  };

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      data-building={builder ? "" : undefined}
      style={{ aspectRatio: `${W} / ${height}` }}
      // A press on the canvas itself lets go of the element that was picked.
      onPointerDown={
        builder
          ? (event: PointerEvent<HTMLDivElement>) => {
              if (event.target === event.currentTarget) {
                builder.select(block.key, null);
              }
            }
          : undefined
      }
    >
      {elements.map((element: IStoreSiteCanvasElement, index: number) => {
        const isSelected: boolean =
          !!builder && builder.selectedElementKey === element.key;

        const href: string | null =
          !builder && element.type === Type.BUTTON
            ? blockButtonHref(element.button, context.siteSlug, context.pages)
            : null;

        const shared = {
          className: styles.element,
          "data-kind": element.type,
          "data-selected": isSelected ? "" : undefined,
          style: { ...styleOf(element), zIndex: index + 1 },
        };

        // On the site a button is a link; in the builder nothing leaves.
        if (href !== null) {
          return (
            <a
              key={element.key}
              {...shared}
              href={href}
              {...(/^https?:/.test(href)
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              onClick={(event) => {
                if (context.mode === "preview") {
                  event.preventDefault();
                }
              }}
            >
              {contentOf(element)}
            </a>
          );
        }

        return (
          <div
            key={element.key}
            {...shared}
            onPointerDown={
              builder ? (event) => begin(event, element, "move") : undefined
            }
            onPointerMove={builder ? move : undefined}
            onPointerUp={builder ? end : undefined}
            onPointerCancel={builder ? end : undefined}
          >
            {contentOf(element)}
            {isSelected &&
              (["right", "bottom", "corner"] as const).map((grip) => (
                <span
                  key={grip}
                  className={styles.grip}
                  data-grip={grip}
                  onPointerDown={(event) => begin(event, element, grip)}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
};

export default PieceCanvas;
