/** What each product shows on the site, and whether they can be searched. */
export interface IStoreSiteCatalog {
  isNameShown: boolean;
  isPriceShown: boolean;
  /** The short description, under the name and the price. */
  isDescriptionShown: boolean;
  /** A search box on the page of products. */
  isSearchShown: boolean;
  /** The "add" button of each product; off, products are only shown. */
  isAddButtonShown: boolean;
  /** A click on a product opens its details. */
  isDetailsOpened: boolean;
  /** The heading of the products section. */
  isTitleShown: boolean;
  /** The owner's own heading; empty, the site says its own. */
  title: string | null;
  /** The owner's own text of the add button; empty, the site says its own. */
  addLabel: string | null;
}

export const CATALOG_TITLE_MAX = 60;
export const CATALOG_ADD_LABEL_MAX = 30;

/**
 * The choices of a site, also for one saved before they existed: it shows
 * the name, the price and the search, and no description.
 */
export const siteCatalogOf = (
  catalog: Partial<IStoreSiteCatalog> | null | undefined,
): IStoreSiteCatalog => ({
  isNameShown: catalog?.isNameShown !== false,
  isPriceShown: catalog?.isPriceShown !== false,
  isDescriptionShown: catalog?.isDescriptionShown === true,
  isSearchShown: catalog?.isSearchShown !== false,
  isAddButtonShown: catalog?.isAddButtonShown !== false,
  isDetailsOpened: catalog?.isDetailsOpened !== false,
  isTitleShown: catalog?.isTitleShown !== false,
  title: catalog?.title?.trim().slice(0, CATALOG_TITLE_MAX) || null,
  addLabel: catalog?.addLabel?.trim().slice(0, CATALOG_ADD_LABEL_MAX) || null,
});
