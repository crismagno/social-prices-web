/** What each product shows on the site, and whether they can be searched. */
export interface IStoreSiteCatalog {
  isNameShown: boolean;
  isPriceShown: boolean;
  /** The short description, under the name and the price. */
  isDescriptionShown: boolean;
  /** A search box on the page of products. */
  isSearchShown: boolean;
}

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
});
