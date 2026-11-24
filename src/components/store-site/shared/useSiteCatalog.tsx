"use client";

import { ReactNode, useMemo, useState } from "react";

import {
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../../shared/business/store-sites/store-site-catalog";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import SiteProductSearch from "./SiteProductSearch";
import useSiteT from "./useSiteT";

interface Params {
  catalog: Partial<IStoreSiteCatalog> | null | undefined;
  products: IPublicSiteProduct[];
  /** The page shown; none is the home. */
  page: IStoreSitePage | null | undefined;
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
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * The owner's choices about the products, and the visitor's search among
 * them. The search looks at the name, the brand and the description, and only
 * exists on the page of products: the home shows them all.
 */
const useSiteCatalog = ({ catalog, products, page }: Params): ISiteCatalog => {
  const t = useSiteT();

  const [query, setQuery] = useState<string>("");

  const view: IStoreSiteCatalog = useMemo(
    () => siteCatalogOf(catalog),
    [catalog],
  );

  const hasSearch: boolean =
    view.isSearchShown &&
    page?.type === StoreSitesEnum.SitePageType.PRODUCTS &&
    products.length > 0;

  const wanted: string = hasSearch ? plain(query.trim()) : "";

  const found: IPublicSiteProduct[] = useMemo(
    () =>
      wanted
        ? products.filter((product: IPublicSiteProduct) =>
            plain(
              [product.name, product.brand, product.description]
                .filter(Boolean)
                .join(" "),
            ).includes(wanted),
          )
        : products,
    [products, wanted],
  );

  return {
    view,
    products: found,
    search: hasSearch ? (
      <SiteProductSearch value={query} onChange={setQuery} />
    ) : null,
    emptyLabel: wanted
      ? t("storeSite.public.noProductsFound")
      : t("storeSite.public.noProducts"),
  };
};

export default useSiteCatalog;
