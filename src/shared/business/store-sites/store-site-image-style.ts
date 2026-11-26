import StoreSitesEnum from "./store-sites.enum";

/** How the images of one place of the site look. */
export interface IStoreSiteImageLook {
  shape: StoreSitesEnum.ImageShape;
  ratio: StoreSitesEnum.ImageRatio;
}

/** Where the images whose look the owner can change are. */
export type TSiteImagePlace = "product" | "section" | "block";

export const SITE_IMAGE_PLACES: TSiteImagePlace[] = [
  "product",
  "section",
  "block",
];

/** How the images of the site look, by place. */
export type IStoreSiteImageStyle = Record<TSiteImagePlace, IStoreSiteImageLook>;

/** The corners of each shape, as CSS draws them. */
export const IMAGE_SHAPE_RADIUS: Record<
  Exclude<StoreSitesEnum.ImageShape, StoreSitesEnum.ImageShape.TEMPLATE>,
  string
> = {
  [StoreSitesEnum.ImageShape.SQUARE]: "0",
  [StoreSitesEnum.ImageShape.SOFT]: "10px",
  [StoreSitesEnum.ImageShape.ROUNDED]: "28px",
  // Far larger than any image: the browser scales it to a half circle on top.
  [StoreSitesEnum.ImageShape.ARCH]: "9999px 9999px 0 0",
  [StoreSitesEnum.ImageShape.CIRCLE]: "50%",
  [StoreSitesEnum.ImageShape.LEAF]: "40px 0",
};

/** Width to height of each proportion, as CSS reads it. */
export const IMAGE_RATIO_VALUE: Record<
  Exclude<StoreSitesEnum.ImageRatio, StoreSitesEnum.ImageRatio.TEMPLATE>,
  string
> = {
  [StoreSitesEnum.ImageRatio.SQUARE]: "1 / 1",
  [StoreSitesEnum.ImageRatio.PORTRAIT]: "4 / 5",
  [StoreSitesEnum.ImageRatio.TALL]: "2 / 3",
  [StoreSitesEnum.ImageRatio.LANDSCAPE]: "4 / 3",
  [StoreSitesEnum.ImageRatio.WIDE]: "16 / 9",
};

const lookOf = (
  look: Partial<IStoreSiteImageLook> | null | undefined,
): IStoreSiteImageLook => {
  const shape: StoreSitesEnum.ImageShape = Object.values(
    StoreSitesEnum.ImageShape,
  ).includes(look?.shape as StoreSitesEnum.ImageShape)
    ? (look?.shape as StoreSitesEnum.ImageShape)
    : StoreSitesEnum.ImageShape.TEMPLATE;

  return {
    shape,
    // A circle is always as tall as it is wide.
    ratio:
      shape === StoreSitesEnum.ImageShape.CIRCLE
        ? StoreSitesEnum.ImageRatio.SQUARE
        : Object.values(StoreSitesEnum.ImageRatio).includes(
              look?.ratio as StoreSitesEnum.ImageRatio,
            )
          ? (look?.ratio as StoreSitesEnum.ImageRatio)
          : StoreSitesEnum.ImageRatio.TEMPLATE,
  };
};

/**
 * The images of a site, also for one saved before the option: each place as
 * the template draws it.
 */
export const siteImageStyleOf = (
  style: Partial<Record<TSiteImagePlace, Partial<IStoreSiteImageLook>>> | null | undefined,
): IStoreSiteImageStyle => ({
  product: lookOf(style?.product),
  section: lookOf(style?.section),
  block: lookOf(style?.block),
});
