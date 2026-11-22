/**
 * The sizes the owner may set on the site, in pixels. Each one is optional:
 * left empty, the template decides. A width or a height is of a picture or a
 * block; for a text, the "size" is that of its letters.
 * Mirrors the API (store-site-sizes.ts): change both together.
 */
export type TSiteSizeKind = "width" | "height" | "blockHeight" | "fontSize";

export const SITE_SIZE_RANGES: Record<TSiteSizeKind, [number, number]> = {
  width: [16, 1600],
  height: [16, 1200],
  blockHeight: [120, 1600],
  fontSize: [8, 200],
};

export const SITE_SIZE_KINDS = {
  logoWidth: "width",
  logoHeight: "height",
  brandNameWidth: "width",
  brandNameHeight: "height",
  brandNameSize: "fontSize",
  heroHeight: "blockHeight",
  heroTitleWidth: "width",
  heroTitleSize: "fontSize",
  heroSubtitleWidth: "width",
  heroSubtitleSize: "fontSize",
  featuredImageWidth: "width",
  featuredImageHeight: "height",
  sectionImageWidth: "width",
  sectionImageHeight: "height",
  sectionTitleSize: "fontSize",
  sectionTextSize: "fontSize",
  productWidth: "width",
  productImageHeight: "height",
  productNameSize: "fontSize",
  aboutTitleSize: "fontSize",
  aboutTextSize: "fontSize",
  aboutMediaWidth: "width",
  aboutMediaHeight: "height",
} as const satisfies Record<string, TSiteSizeKind>;

export type TSiteSizeKey = keyof typeof SITE_SIZE_KINDS;

export const SITE_SIZE_KEYS: TSiteSizeKey[] = Object.keys(
  SITE_SIZE_KINDS,
) as TSiteSizeKey[];

export type TStoreSiteSizes = Record<TSiteSizeKey, number | null>;

export const EMPTY_SITE_SIZES: TStoreSiteSizes = SITE_SIZE_KEYS.reduce(
  (sizes: TStoreSiteSizes, key: TSiteSizeKey) => ({ ...sizes, [key]: null }),
  {} as TStoreSiteSizes,
);

export const siteSizeRange = (key: TSiteSizeKey): [number, number] =>
  SITE_SIZE_RANGES[SITE_SIZE_KINDS[key]];

/** Only known sizes, whole pixels, inside what a page can take. */
export const siteSizesOf = (
  sizes: Partial<Record<string, unknown>> | null | undefined,
): TStoreSiteSizes =>
  SITE_SIZE_KEYS.reduce((result: TStoreSiteSizes, key: TSiteSizeKey) => {
    const value: unknown = sizes?.[key];
    const [min, max] = siteSizeRange(key);

    result[key] =
      typeof value === "number" && Number.isFinite(value)
        ? Math.min(max, Math.max(min, Math.round(value)))
        : null;

    return result;
  }, {} as TStoreSiteSizes);
