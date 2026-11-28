import { IStoreSiteBlockButton, blockButtonOf } from "./store-site-blocks";
import StoreSitesEnum from "./store-sites.enum";

/** The border of the header: its line, how thick, and its colour. */
export interface IStoreSiteHeaderBorder {
  style: StoreSitesEnum.BorderStyle;
  /** In pixels. */
  width: number;
  /** As #rrggbb; empty, the colour of the site's words. */
  color: string | null;
}

/**
 * The header of the site: its name, its menu, the sign-in and the cart. It is
 * the site's own, the same on every page, apart from any entrance.
 */
export interface IStoreSiteHeader {
  /** At the top only: it stays on screen while the visitor scrolls. */
  isFixed: boolean;
  /** The side of the screen it is at. */
  position: StoreSitesEnum.HeaderPosition;
  /** Its three parts in order: start, middle and end of the header. */
  order: StoreSitesEnum.HeaderPart[];
  /**
   * How clean its background is, from 0 (solid) to 100 (none at all). With
   * any, at the top it lies over the entrance instead of taking room.
   */
  transparency: number;
  /**
   * How strong its shadow is, from 0 (none) to 100. Empty, the usual one: a
   * light shadow, and none on a clean header or down a side.
   */
  shadow: number | null;
  /** The border on its edge that faces the page; empty, the usual thin line. */
  border: IStoreSiteHeaderBorder | null;
  /** The colour of its words; empty, the site's. */
  color: string | null;
  /** The colour of its background, when it has one; empty, the site's. */
  background: string | null;
  /** How tall it is at the top or at the bottom, in pixels; empty, as its content. */
  height: number | null;
  /** How wide it is down a side, in pixels; empty, the usual width. */
  width: number | null;
  /** Buttons the owner added, beside the sign-in and the cart. */
  buttons: IStoreSiteBlockButton[];
  /**
   * The order of its buttons, one by one: `SIGN_IN`, `CART` and each of the
   * owner's own as `BUTTON_<its place in buttons>`.
   */
  actionsOrder: string[];
  /** The size of the owner's own buttons and of the sign-in. */
  buttonSize: StoreSitesEnum.CartButtonSize;
  /**
   * Where each part sits within its place; one left out sits as its place
   * says (the start to the left, the middle centred, the end to the right).
   */
  aligns: Partial<
    Record<StoreSitesEnum.HeaderPart, StoreSitesEnum.HeaderAlign>
  >;
}

/** Where a place of the header puts its part when the owner did not say. */
export const HEADER_SLOT_ALIGNS: StoreSitesEnum.HeaderAlign[] = [
  StoreSitesEnum.HeaderAlign.LEFT,
  StoreSitesEnum.HeaderAlign.CENTER,
  StoreSitesEnum.HeaderAlign.RIGHT,
];

/** The place of one of the owner's buttons in the order of the header. */
export const headerButtonToken = (index: number): string =>
  `${StoreSitesEnum.HEADER_BUTTON_PREFIX}${index}`;

/** The button of the owner a place in the order stands for, or -1. */
export const headerButtonIndex = (token: string): number =>
  token.startsWith(StoreSitesEnum.HEADER_BUTTON_PREFIX)
    ? Number(token.slice(StoreSitesEnum.HEADER_BUTTON_PREFIX.length))
    : -1;

/**
 * The buttons of the header one by one, in the order given: the sign-in, the
 * cart and each of the owner's own, every one once. An order kept when the
 * owner's buttons went together has them where that group was; what the order
 * does not say goes last.
 */
export const actionsOrderOf = (
  order: string[] | null | undefined,
  buttonCount: number,
): string[] => {
  const own: string[] = Array.from({ length: buttonCount }, (_, index) =>
    headerButtonToken(index),
  );

  const all: string[] = [
    ...own,
    StoreSitesEnum.HeaderAction.SIGN_IN,
    StoreSitesEnum.HeaderAction.CART,
  ];

  const given: string[] = (Array.isArray(order) ? order : []).flatMap(
    (each: string) =>
      each === StoreSitesEnum.HeaderAction.BUTTONS ? own : [String(each)],
  );

  const kept: string[] = Array.from(
    new Set(given.filter((each: string) => all.includes(each))),
  );

  return [...kept, ...all.filter((each: string) => !kept.includes(each))];
};

export const HEADER_HEIGHT_RANGE: [number, number] = [40, 200];
export const HEADER_WIDTH_RANGE: [number, number] = [160, 480];

const pixelsOf = (
  value: unknown,
  [min, max]: [number, number],
): number | null =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : null;

const PARTS: StoreSitesEnum.HeaderPart[] = Object.values(
  StoreSitesEnum.HeaderPart,
);

const HEX: RegExp = /^#[0-9a-fA-F]{6}$/;

/** The border the owner chose, checked the way the API checks it. */
const borderOf = (
  border: Partial<IStoreSiteHeaderBorder> | null | undefined,
): IStoreSiteHeaderBorder | null => {
  if (
    !border ||
    !Object.values(StoreSitesEnum.BorderStyle).includes(
      border.style as StoreSitesEnum.BorderStyle,
    )
  ) {
    return null;
  }

  const [min, max] = StoreSitesEnum.HEADER_BORDER_WIDTH_RANGE;

  return {
    style: border.style as StoreSitesEnum.BorderStyle,
    width:
      typeof border.width === "number" && Number.isFinite(border.width)
        ? Math.min(max, Math.max(min, Math.round(border.width)))
        : 1,
    color: border.color && HEX.test(border.color) ? border.color : null,
  };
};

/** The header of a site, also for one saved before the options: at the top. */
export const siteHeaderOf = (
  header: Partial<IStoreSiteHeader> | null | undefined,
): IStoreSiteHeader => {
  const order: StoreSitesEnum.HeaderPart[] = Array.isArray(header?.order)
    ? (header?.order ?? [])
    : [];

  const buttons: IStoreSiteBlockButton[] = (
    Array.isArray(header?.buttons) ? (header?.buttons ?? []) : []
  )
    .slice(0, StoreSitesEnum.MAX_HEADER_BUTTONS)
    .map(blockButtonOf);

  return {
    isFixed: header?.isFixed === true,
    position: Object.values(StoreSitesEnum.HeaderPosition).includes(
      header?.position as StoreSitesEnum.HeaderPosition,
    )
      ? (header?.position as StoreSitesEnum.HeaderPosition)
      : StoreSitesEnum.HeaderPosition.TOP,
    // The three parts, each once; anything else is the usual order.
    order:
      order.length === PARTS.length &&
      PARTS.every((part: StoreSitesEnum.HeaderPart) => order.includes(part))
        ? order
        : [...PARTS],
    // One saved when this was only on or off is fully clean when it was on.
    transparency:
      typeof header?.transparency === "number" &&
      Number.isFinite(header.transparency)
        ? Math.min(100, Math.max(0, Math.round(header.transparency)))
        : (header as { isTransparent?: boolean } | null | undefined)
              ?.isTransparent === true
          ? 100
          : 0,
    shadow:
      typeof header?.shadow === "number" && Number.isFinite(header.shadow)
        ? Math.min(100, Math.max(0, Math.round(header.shadow)))
        : null,
    border: borderOf(header?.border),
    color: header?.color && HEX.test(header.color) ? header.color : null,
    background:
      header?.background && HEX.test(header.background)
        ? header.background
        : null,
    height: pixelsOf(header?.height, HEADER_HEIGHT_RANGE),
    width: pixelsOf(header?.width, HEADER_WIDTH_RANGE),
    buttons,
    actionsOrder: actionsOrderOf(header?.actionsOrder, buttons.length),
    buttonSize: Object.values(StoreSitesEnum.CartButtonSize).includes(
      header?.buttonSize as StoreSitesEnum.CartButtonSize,
    )
      ? (header?.buttonSize as StoreSitesEnum.CartButtonSize)
      : StoreSitesEnum.CartButtonSize.MEDIUM,
    aligns: PARTS.reduce(
      (
        kept: Partial<
          Record<StoreSitesEnum.HeaderPart, StoreSitesEnum.HeaderAlign>
        >,
        part: StoreSitesEnum.HeaderPart,
      ) =>
        Object.values(StoreSitesEnum.HeaderAlign).includes(
          header?.aligns?.[part] as StoreSitesEnum.HeaderAlign,
        )
          ? { ...kept, [part]: header?.aligns?.[part] }
          : kept,
      {},
    ),
  };
};
