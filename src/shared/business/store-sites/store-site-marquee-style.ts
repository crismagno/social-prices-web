import StoreSitesEnum from "./store-sites.enum";

/** How the strip of phrases looks and runs; empty is the template's own. */
export interface IStoreSiteMarqueeStyle {
  speed: StoreSitesEnum.MarqueeSpeed;
  direction: StoreSitesEnum.MarqueeDirection;
  /** Between the phrases; empty, the template's own symbol. */
  separator: string | null;
  size: StoreSitesEnum.MarqueeSize;
  background: string | null;
  color: string | null;
  pauseOnHover: boolean;
}

/** Ready separators the owner can pick; any other of up to 3 characters too. */
export const MARQUEE_SEPARATORS: string[] = [
  "•",
  "✦",
  "★",
  "❀",
  "≈",
  "|",
  "—",
  "/",
];

export const MARQUEE_SEPARATOR_MAX: number = 3;

const HEX: RegExp = /^#[0-9a-fA-F]{6}$/;

const oneOf = <T extends string>(
  value: unknown,
  options: T[],
  fallback: T,
): T => (options.includes(value as T) ? (value as T) : fallback);

/** The look of the strip, also for one saved before the options: the template's. */
export const siteMarqueeStyleOf = (
  style: Partial<IStoreSiteMarqueeStyle> | null | undefined,
): IStoreSiteMarqueeStyle => ({
  speed: oneOf(
    style?.speed,
    Object.values(StoreSitesEnum.MarqueeSpeed),
    StoreSitesEnum.MarqueeSpeed.NORMAL,
  ),
  direction: oneOf(
    style?.direction,
    Object.values(StoreSitesEnum.MarqueeDirection),
    StoreSitesEnum.MarqueeDirection.LEFT,
  ),
  separator: style?.separator?.trim()
    ? Array.from(style.separator.trim())
        .slice(0, MARQUEE_SEPARATOR_MAX)
        .join("")
    : null,
  size: oneOf(
    style?.size,
    Object.values(StoreSitesEnum.MarqueeSize),
    StoreSitesEnum.MarqueeSize.MEDIUM,
  ),
  background:
    style?.background && HEX.test(style.background) ? style.background : null,
  color: style?.color && HEX.test(style.color) ? style.color : null,
  pauseOnHover: style?.pauseOnHover === true,
});
