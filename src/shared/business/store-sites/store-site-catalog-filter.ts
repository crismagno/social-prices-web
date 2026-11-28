import StoreSitesEnum from "./store-sites.enum";

/** The colours of the filter of products; empty, the site's own. */
export interface IStoreSiteCatalogFilterColors {
  background: string | null;
  text: string | null;
  accent: string | null;
}

/**
 * The filter of the page of products: a panel that floats on one side, with
 * the ways of narrowing the products the owner left on. Mirrors the API
 * (store-site-catalog-filter.ts): change both together.
 */
export interface IStoreSiteCatalogFilter {
  isShown: boolean;
  side: StoreSitesEnum.CatalogFilterSide;
  /** Its heading; empty, the site says its own. */
  title: string | null;
  /** Each way of filtering, on or off. */
  fields: Record<StoreSitesEnum.CatalogFilterField, boolean>;
  colors: IStoreSiteCatalogFilterColors;
}

export const FILTER_TITLE_MAX: number = 40;

const HEX: RegExp = /^#[0-9a-fA-F]{6}$/;

const hexOf = (value: unknown): string | null =>
  typeof value === "string" && HEX.test(value) ? value : null;

/**
 * The filter of a site, also for one saved before it existed: none. Once on,
 * every way of filtering is there until the owner turns it off. The title is
 * kept as typed while it is being written; the API trims it.
 */
export const catalogFilterOf = (
  filter: Partial<IStoreSiteCatalogFilter> | null | undefined,
): IStoreSiteCatalogFilter => ({
  isShown: filter?.isShown === true,
  side:
    filter?.side === StoreSitesEnum.CatalogFilterSide.RIGHT
      ? StoreSitesEnum.CatalogFilterSide.RIGHT
      : StoreSitesEnum.CatalogFilterSide.LEFT,
  title:
    typeof filter?.title === "string" && filter.title.trim()
      ? filter.title.slice(0, FILTER_TITLE_MAX)
      : null,
  fields: Object.values(StoreSitesEnum.CatalogFilterField).reduce(
    (
      kept: Record<StoreSitesEnum.CatalogFilterField, boolean>,
      field: StoreSitesEnum.CatalogFilterField,
    ) => ({ ...kept, [field]: filter?.fields?.[field] !== false }),
    {} as Record<StoreSitesEnum.CatalogFilterField, boolean>,
  ),
  colors: {
    background: hexOf(filter?.colors?.background),
    text: hexOf(filter?.colors?.text),
    accent: hexOf(filter?.colors?.accent),
  },
});
