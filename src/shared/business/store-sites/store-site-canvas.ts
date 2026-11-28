import { IStoreSiteAboutMedia } from "./store-site-about";
import { IStoreSiteBlockButton } from "./store-site-blocks";
import { IStoreSiteMap, siteMapOf } from "./store-site-map";
import { IStoreSiteContactForm, siteContactFormOf } from "./store-site-contact";
import StoreSitesEnum from "./store-sites.enum";

/**
 * One thing placed on a free canvas: where it is, how big, and how it looks.
 * Its place and its size are in pixels of a canvas 1200 wide; the site scales
 * them to whatever width the screen has. Mirrors the API
 * (store-site-canvas.ts): change both together.
 */
export interface IStoreSiteCanvasElement {
  key: string;
  type: StoreSitesEnum.CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** The words of a text, of a button, or written inside a box. */
  text: string | null;
  fontSize: number;
  isBold: boolean;
  align: StoreSitesEnum.CanvasAlign;
  /** The colour of its words, or of a divider's line; as #rrggbb. */
  color: string | null;
  background: string | null;
  /** How round its corners are, in pixels. */
  radius: number;
  /** How solid it is, in percent. */
  opacity: number;
  borderWidth: number;
  borderColor: string | null;
  /** The file of an image. */
  imageUrl: string | null;
  /** A video: uploaded, or a YouTube/Vimeo player. */
  media: IStoreSiteAboutMedia | null;
  /** Where a button leads. */
  button: IStoreSiteBlockButton | null;
  /** The places of a map, and how it opens. */
  map: IStoreSiteMap | null;
  /** A form: what it asks, its button, its box and where it goes. */
  form: IStoreSiteContactForm | null;
}

/** A free canvas: its height and what was placed on it, back to front. */
export interface IStoreSiteCanvas {
  height: number;
  elements: IStoreSiteCanvasElement[];
}

/** Where an element is and how big: what dragging and resizing change. */
export type TCanvasBox = Pick<
  IStoreSiteCanvasElement,
  "x" | "y" | "width" | "height"
>;

export const CANVAS_LIMITS = {
  /** The width every place and size is measured against. */
  width: 1200,
  height: [80, 4000] as [number, number],
  defaultHeight: 480,
  elements: 60,
  text: 8000,
  fontSize: [8, 240] as [number, number],
  radius: 600,
  border: 40,
  imageKey: 400,
} as const;

type TRecord = Record<string, unknown>;

const recordOf = (value: unknown): TRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as TRecord)
    : {};

const HEX: RegExp = /^#[0-9a-fA-F]{6}$/;

const hexOf = (value: unknown): string | null =>
  typeof value === "string" && HEX.test(value) ? value : null;

const numberOf = (
  value: unknown,
  [min, max]: [number, number],
  fallback: number,
): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

/** What the canvas borrows from the blocks: their own checks, not copies. */
export interface ICanvasChecks {
  buttonOf: (button: unknown) => IStoreSiteBlockButton;
  mediaOf: (media: unknown) => IStoreSiteAboutMedia | null;
}

const Type = StoreSitesEnum.CanvasElementType;

/**
 * An element kept inside a canvas of this height: never wider or taller than
 * it, never out of reach.
 */
export const boxWithin = (
  box: TCanvasBox,
  canvasHeight: number,
): TCanvasBox => {
  const width: number = numberOf(box.width, [8, CANVAS_LIMITS.width], 200);
  const height: number = numberOf(box.height, [2, canvasHeight], 80);

  return {
    width,
    height,
    x: numberOf(box.x, [0, CANVAS_LIMITS.width - width], 0),
    y: numberOf(box.y, [0, canvasHeight - height], 0),
  };
};

/**
 * A canvas, whatever was stored: its height within what a page can take, and
 * only elements of a known kind, each with a key of its own, inside the
 * canvas. The API checks it the same way. Words are kept as typed while they
 * are being written.
 */
export const siteCanvasOf = (
  raw: unknown,
  { buttonOf, mediaOf }: ICanvasChecks,
): IStoreSiteCanvas => {
  const source: TRecord = recordOf(raw);

  const height: number = numberOf(
    source.height,
    CANVAS_LIMITS.height,
    CANVAS_LIMITS.defaultHeight,
  );

  const taken: Set<string> = new Set();

  const elements: IStoreSiteCanvasElement[] = (
    Array.isArray(source.elements) ? source.elements : []
  )
    .map(recordOf)
    .filter((element: TRecord) =>
      Object.values(Type).includes(
        element.type as StoreSitesEnum.CanvasElementType,
      ),
    )
    .slice(0, CANVAS_LIMITS.elements)
    .map((element: TRecord, index: number): IStoreSiteCanvasElement => {
      const type = element.type as StoreSitesEnum.CanvasElementType;

      const given: string =
        typeof element.key === "string" ? element.key.trim() : "";

      const key: string =
        /^[A-Za-z0-9_-]{1,40}$/.test(given) && !taken.has(given)
          ? given
          : `e${index}-${taken.size}`;

      taken.add(key);

      return {
        key,
        type,
        ...boxWithin(element as unknown as TCanvasBox, height),
        text:
          typeof element.text === "string" && element.text
            ? element.text.slice(0, CANVAS_LIMITS.text)
            : null,
        fontSize: numberOf(element.fontSize, CANVAS_LIMITS.fontSize, 24),
        isBold: element.isBold === true,
        align: Object.values(StoreSitesEnum.CanvasAlign).includes(
          element.align as StoreSitesEnum.CanvasAlign,
        )
          ? (element.align as StoreSitesEnum.CanvasAlign)
          : StoreSitesEnum.CanvasAlign.LEFT,
        color: hexOf(element.color),
        background: hexOf(element.background),
        radius: numberOf(element.radius, [0, CANVAS_LIMITS.radius], 0),
        opacity: numberOf(element.opacity, [0, 100], 100),
        borderWidth: numberOf(
          element.borderWidth,
          [0, CANVAS_LIMITS.border],
          0,
        ),
        borderColor: hexOf(element.borderColor),
        imageUrl:
          type === Type.IMAGE &&
          typeof element.imageUrl === "string" &&
          element.imageUrl.trim()
            ? element.imageUrl.trim().slice(0, CANVAS_LIMITS.imageKey)
            : null,
        media: type === Type.VIDEO ? mediaOf(element.media) : null,
        button: type === Type.BUTTON ? buttonOf(element.button) : null,
        map: type === Type.MAP ? siteMapOf(element.map) : null,
        form:
          type === Type.FORM
            ? siteContactFormOf(
                element.form as Partial<IStoreSiteContactForm> | null,
              )
            : null,
      };
    });

  return { height, elements };
};

const newKey = (): string =>
  `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** How each kind starts: its size, and what makes it visible at once. */
const STARTS: Record<
  StoreSitesEnum.CanvasElementType,
  Partial<IStoreSiteCanvasElement>
> = {
  [Type.TEXT]: { width: 420, height: 70, fontSize: 40, isBold: true },
  [Type.BUTTON]: {
    width: 200,
    height: 56,
    fontSize: 18,
    isBold: true,
    radius: 99,
    align: StoreSitesEnum.CanvasAlign.CENTER,
  },
  [Type.BOX]: { width: 320, height: 220, radius: 24 },
  [Type.IMAGE]: { width: 320, height: 240, radius: 16 },
  [Type.VIDEO]: { width: 480, height: 270, radius: 16 },
  [Type.DIVIDER]: { width: 400, height: 4 },
  [Type.MAP]: { width: 520, height: 340, radius: 16 },
  [Type.FORM]: { width: 440, height: 520 },
};

/**
 * A new element of a kind, placed where it does not hide the last one: each
 * new one a little down and to the right of where the first would go.
 */
export const newCanvasElement = (
  type: StoreSitesEnum.CanvasElementType,
  text: string | null,
  count: number,
  button: IStoreSiteBlockButton | null,
): IStoreSiteCanvasElement => ({
  key: newKey(),
  type,
  x: 60 + (count % 8) * 28,
  y: 40 + (count % 8) * 28,
  width: 200,
  height: 80,
  text,
  fontSize: 24,
  isBold: false,
  align: StoreSitesEnum.CanvasAlign.LEFT,
  color: null,
  background: null,
  radius: 0,
  opacity: 100,
  borderWidth: 0,
  borderColor: null,
  imageUrl: null,
  media: null,
  button: type === Type.BUTTON ? button : null,
  map: type === Type.MAP ? siteMapOf(null) : null,
  form: type === Type.FORM ? siteContactFormOf(null) : null,
  ...STARTS[type],
});
