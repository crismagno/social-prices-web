"use client";

import { ReactNode, useMemo, useState } from "react";

import {
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../../shared/business/store-sites/store-site-catalog";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import {
  EMPTY_PRODUCT_FILTER,
  IProductFacets,
  IProductFilterState,
  filterProducts,
  isForYears,
  productFacetsOf,
} from "./site-product-filter";
import SiteProductFilter from "./SiteProductFilter";
import SiteProductSearch from "./SiteProductSearch";
import useSiteT from "./useSiteT";
import { yearRangeLabel } from "../../../shared/business/products/products.interface";
import { richTextToPlain } from "../../../shared/utils/rich-text/rich-text";

interface Params {
  catalog: Partial<IStoreSiteCatalog> | null | undefined;
  products: IPublicSiteProduct[];
  /** The page shown; none is the home. */
  page: IStoreSitePage | null | undefined;
  /** The site's main colour, for the controls of the filter. */
  accent?: string;
}

/** What a template needs to draw the products the way the owner chose. */
export interface ISiteCatalog {
  /** What each product shows. */
  view: IStoreSiteCatalog;
  /** The products to draw: all of them, or the ones the search left. */
  products: IPublicSiteProduct[];
  /** The search box, on the page of products when the owner wants it. */
  search: ReactNode;
  /** What to say when there is nothing to draw. */
  emptyLabel: string;
}

// Lowercase and without accents, so "cafe" finds "Café".
const plain = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * The owner's choices about the products, and the visitor's search among
 * them. The search looks at the name, the brand and the description, and only
 * exists on the page of products: the home shows them all.
 */
const useSiteCatalog = ({
  catalog,
  products,
  page,
  accent,
}: Params): ISiteCatalog => {
  const t = useSiteT();

  const [query, setQuery] = useState<string>("");
  const [chosen, setChosen] =
    useState<IProductFilterState>(EMPTY_PRODUCT_FILTER);

  const view: IStoreSiteCatalog = useMemo(
    () => siteCatalogOf(catalog),
    [catalog],
  );

  // Searching and filtering exist only on the page of products.
  const isProductsPage: boolean =
    page?.type === StoreSitesEnum.SitePageType.PRODUCTS && products.length > 0;

  const hasSearch: boolean = view.isSearchShown && isProductsPage;
  const hasFilter: boolean = view.filter.isShown && isProductsPage;

  // The filter has a box for the same words the search box takes.
  const hasText: boolean =
    hasSearch ||
    (hasFilter && view.filter.fields[StoreSitesEnum.CatalogFilterField.TEXT]);

  const wanted: string = hasText ? plain(query.trim()) : "";

  const facets: IProductFacets = useMemo(
    () => productFacetsOf(products),
    [products],
  );

  const found: IPublicSiteProduct[] = useMemo(
    () =>
      wanted
        ? products.filter(
            (product: IPublicSiteProduct) =>
              plain(
                [
                  product.name,
                  product.brand,
                  richTextToPlain(product.description),
                  yearRangeLabel(product.yearRange),
                  // The items it is kept as are found by their names too.
                  ...(product.variants ?? []).map((variant) => variant.name),
                ]
                  .filter(Boolean)
                  .join(" "),
              ).includes(wanted) ||
              // A year alone finds what is for that year, written or not.
              (/^\d{4}$/.test(wanted) &&
                isForYears(product, [Number(wanted), Number(wanted)])),
          )
        : products,
    [products, wanted],
  );

  // What the filter leaves of what the search found, in the order asked for.
  const shown: IPublicSiteProduct[] = useMemo(
    () =>
      hasFilter ? filterProducts(found, chosen, view.filter.fields) : found,
    [hasFilter, found, chosen, view.filter.fields],
  );

  const isNarrowed: boolean =
    !!wanted || (hasFilter && shown.length < found.length);

  return {
    view,
    products: shown,
    search:
      hasSearch || hasFilter ? (
        <>
          {hasSearch && <SiteProductSearch value={query} onChange={setQuery} />}
          {hasFilter && (
            <SiteProductFilter
              settings={view.filter}
              facets={facets}
              state={chosen}
              onChange={setChosen}
              text={query}
              onTextChange={setQuery}
              found={shown.length}
              accent={accent}
            />
          )}
        </>
      ) : null,
    emptyLabel: isNarrowed
      ? t("storeSite.public.noProductsFound")
      : t("storeSite.public.noProducts"),
  };
};

export default useSiteCatalog;
