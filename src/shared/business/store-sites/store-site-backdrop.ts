import StoreSitesEnum from "./store-sites.enum";

/**
 * What lies behind the whole site, from the entrance to the footer: the
 * site's colour as always, images that take turns, or a video.
 */
export interface IStoreSiteBackdrop {
  type: StoreSitesEnum.BackdropType;
  /** The images, in the order they are shown. */
  imageUrls: string[];
  /** Seconds each image stays, when there is more than one. */
  slideSeconds: number;
  /** An uploaded video: it plays in a loop, without sound. */
  videoUrl: string | null;
  /** The image shown on a phone and while the video loads. */
  posterUrl: string | null;
  /** How much of the site's colour lies over it, in percent: keeps words readable. */
  veil: number;
  blur: StoreSitesEnum.BackdropBlur;
  /** Whether it moves slowly, closer and farther. */
  isAnimated: boolean;
}

const oneOf = <T extends string>(
  value: unknown,
  options: T[],
  fallback: T,
): T => (options.includes(value as T) ? (value as T) : fallback);

const fileKeyOf = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const numberOf = (
  value: unknown,
  [min, max]: [number, number],
  fallback: number,
): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

/**
 * What lies behind a site, whatever was stored: its colour, as always, unless
 * the owner chose images or a video. The API checks it the same way.
 */
export const siteBackdropOf = (
  backdrop: Partial<IStoreSiteBackdrop> | null | undefined,
): IStoreSiteBackdrop => ({
  type: oneOf(
    backdrop?.type,
    Object.values(StoreSitesEnum.BackdropType),
    StoreSitesEnum.BackdropType.COLOR,
  ),
  imageUrls: Array.from(
    new Set(
      (backdrop?.imageUrls && Array.isArray(backdrop.imageUrls)
        ? backdrop.imageUrls
        : []
      )
        .map(fileKeyOf)
        .filter((key: string | null): key is string => !!key),
    ),
  ).slice(0, StoreSitesEnum.MAX_BACKDROP_IMAGES),
  slideSeconds: numberOf(
    backdrop?.slideSeconds,
    [StoreSitesEnum.MIN_SLIDE_SECONDS, StoreSitesEnum.MAX_SLIDE_SECONDS],
    StoreSitesEnum.DEFAULT_SLIDE_SECONDS,
  ),
  videoUrl: fileKeyOf(backdrop?.videoUrl),
  posterUrl: fileKeyOf(backdrop?.posterUrl),
  veil: numberOf(
    backdrop?.veil,
    StoreSitesEnum.BACKDROP_VEIL_RANGE,
    StoreSitesEnum.DEFAULT_BACKDROP_VEIL,
  ),
  blur: oneOf(
    backdrop?.blur,
    Object.values(StoreSitesEnum.BackdropBlur),
    StoreSitesEnum.BackdropBlur.NONE,
  ),
  isAnimated: backdrop?.isAnimated !== false,
});

/**
 * Whether there is something to draw behind the site: images chosen and at
 * least one sent, or a video chosen with the video or its image sent. Until
 * then the site keeps its colour.
 */
export const hasBackdrop = (backdrop: IStoreSiteBackdrop): boolean =>
  backdrop.type === StoreSitesEnum.BackdropType.IMAGES
    ? backdrop.imageUrls.length > 0
    : backdrop.type === StoreSitesEnum.BackdropType.VIDEO
      ? !!backdrop.videoUrl || !!backdrop.posterUrl
      : false;

/**
 * What lies behind a page: its own when the owner gave it one, else what
 * lies behind the site.
 */
export const backdropOfPage = (
  site: Partial<IStoreSiteBackdrop> | null | undefined,
  page: Partial<IStoreSiteBackdrop> | null | undefined,
): IStoreSiteBackdrop => siteBackdropOf(page ?? site);
