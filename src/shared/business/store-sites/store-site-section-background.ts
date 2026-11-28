import StoreSitesEnum from "./store-sites.enum";

/**
 * What lies behind one section of a page: a colour, a gradient or an image,
 * as see-through and as faded at its edges as the owner wants, with room
 * above and below what the section holds. Mirrors the API
 * (store-site-section-background.ts): change both together.
 */
export interface IStoreSiteSectionBackground {
  type: StoreSitesEnum.SectionBackgroundType;
  /** The colour, or where a gradient starts; as #rrggbb. */
  color: string | null;
  /** Where a gradient ends. */
  color2: string | null;
  /** The direction of a gradient, in degrees. */
  angle: number;
  /** Whether a gradient keeps moving. */
  isAnimated: boolean;
  /** The file of an image. */
  imageUrl: string | null;
  /** How solid it is, in percent. */
  opacity: number;
  /** How much of its top and bottom fade away into the page, in percent. */
  fade: number;
  /** How blurred an image is, in pixels. */
  blur: number;
  /** Room above and below what the section holds, in pixels. */
  spaceTop: number | null;
  spaceBottom: number | null;
  /** Across the whole screen; off, a rounded panel around the section. */
  isWide: boolean;
}

export const SECTION_BACKGROUND_LIMITS = {
  space: 400,
  blur: 40,
  imageKey: 400,
} as const;

const DEFAULT_ANGLE: number = 135;

const HEX: RegExp = /^#[0-9a-fA-F]{6}$/;

const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

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

const spaceOf = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 1
    ? Math.min(SECTION_BACKGROUND_LIMITS.space, Math.round(value))
    : null;

/** A background as the editor starts one: every measure at its usual value. */
export const newSectionBackground = (
  patch: Partial<IStoreSiteSectionBackground> = {},
): IStoreSiteSectionBackground => ({
  type: StoreSitesEnum.SectionBackgroundType.NONE,
  color: null,
  color2: null,
  angle: DEFAULT_ANGLE,
  isAnimated: false,
  imageUrl: null,
  opacity: 100,
  fade: 0,
  blur: 0,
  spaceTop: null,
  spaceBottom: null,
  isWide: true,
  ...patch,
});

/**
 * The background of a section, whatever was stored; nothing when the owner
 * chose none and added no room. The API checks it the same way.
 */
export const sectionBackgroundOf = (
  raw: unknown,
): IStoreSiteSectionBackground | null => {
  const source: Record<string, unknown> = recordOf(raw);

  const type: StoreSitesEnum.SectionBackgroundType = Object.values(
    StoreSitesEnum.SectionBackgroundType,
  ).includes(source.type as StoreSitesEnum.SectionBackgroundType)
    ? (source.type as StoreSitesEnum.SectionBackgroundType)
    : StoreSitesEnum.SectionBackgroundType.NONE;

  const spaceTop: number | null = spaceOf(source.spaceTop);
  const spaceBottom: number | null = spaceOf(source.spaceBottom);

  if (
    type === StoreSitesEnum.SectionBackgroundType.NONE &&
    spaceTop === null &&
    spaceBottom === null
  ) {
    return null;
  }

  return {
    type,
    color: hexOf(source.color),
    color2: hexOf(source.color2),
    angle: numberOf(source.angle, [0, 360], DEFAULT_ANGLE),
    isAnimated: source.isAnimated === true,
    imageUrl:
      typeof source.imageUrl === "string" && source.imageUrl.trim()
        ? source.imageUrl.trim().slice(0, SECTION_BACKGROUND_LIMITS.imageKey)
        : null,
    opacity: numberOf(source.opacity, [0, 100], 100),
    fade: numberOf(source.fade, [0, 100], 0),
    blur: numberOf(source.blur, [0, SECTION_BACKGROUND_LIMITS.blur], 0),
    spaceTop,
    spaceBottom,
    isWide: source.isWide !== false,
  };
};
