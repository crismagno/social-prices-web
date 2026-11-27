import StoreSitesEnum from "./store-sites.enum";

/** The line the cards with content of their own are laid out on. */
export interface IStoreSiteCardsStyle {
  /** The template's own way, or the choices below and each card's. */
  layout: StoreSitesEnum.CardsLayout;
  /** How many places a line has before the next one. */
  columns: number;
  gap: StoreSitesEnum.CardsGap;
}

/** How one card is drawn, each its own way. */
export interface IStoreSiteCardLook {
  imagePosition: StoreSitesEnum.CardsImagePosition;
  textAlign: StoreSitesEnum.CardsAlign;
  look: StoreSitesEnum.CardsLook;
  /** How many places of the line it takes. */
  span: number;
}

const oneOf = <T extends string>(
  value: unknown,
  options: T[],
  fallback: T,
): T => (options.includes(value as T) ? (value as T) : fallback);

/** A number of places within what a line can have, or the one given. */
const placesOf = (value: unknown, fallback: number): number => {
  const [min, max] = StoreSitesEnum.CARDS_COLUMNS_RANGE;

  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;
};

const DEFAULT_COLUMNS: number = 3;

/**
 * The line cards are laid out on, whatever was stored: as the template draws
 * them unless the owner chose otherwise, and then three places a line. The
 * API checks it the same way.
 */
export const siteCardsStyleOf = (
  style: Partial<IStoreSiteCardsStyle> | null | undefined,
): IStoreSiteCardsStyle => ({
  layout: oneOf(
    style?.layout,
    Object.values(StoreSitesEnum.CardsLayout),
    StoreSitesEnum.CardsLayout.TEMPLATE,
  ),
  columns: placesOf(style?.columns, DEFAULT_COLUMNS),
  gap: oneOf(
    style?.gap,
    Object.values(StoreSitesEnum.CardsGap),
    StoreSitesEnum.CardsGap.MEDIUM,
  ),
});

/**
 * How one card is drawn, whatever was stored: its image on top, its words to
 * the left, nothing around it and one place of the line, until the owner
 * chooses each for that card.
 */
export const siteCardLookOf = (
  look: Partial<IStoreSiteCardLook> | null | undefined,
): IStoreSiteCardLook => ({
  imagePosition: oneOf(
    look?.imagePosition,
    Object.values(StoreSitesEnum.CardsImagePosition),
    StoreSitesEnum.CardsImagePosition.TOP,
  ),
  textAlign: oneOf(
    look?.textAlign,
    Object.values(StoreSitesEnum.CardsAlign),
    StoreSitesEnum.CardsAlign.LEFT,
  ),
  look: oneOf(
    look?.look,
    Object.values(StoreSitesEnum.CardsLook),
    StoreSitesEnum.CardsLook.PLAIN,
  ),
  span: placesOf(look?.span, 1),
});
