"use client";

import { siteImageStyleProps } from "../../../components/store-site/shared/site-image-style";
import base from "../../../components/store-site/shared/site-base.module.css";
import { siteCartButtonOf } from "../../../shared/business/store-sites/store-site-cart-button";
import {
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../../shared/business/store-sites/store-site-catalog";
import SiteStickyBar from "../../../components/store-site/shared/SiteStickyBar";
import { sitePageView } from "../../../components/store-site/shared/site-page-view";
import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import ScrollProgress from "../../../components/store-site/shared/ScrollProgress";
import SiteCart from "../../../components/store-site/shared/SiteCart";
import SiteProductModal from "../../../components/store-site/shared/SiteProductModal";
import SiteChatWidget from "../../../components/store-site/shared/SiteChatWidget";
import { usePageLabel } from "../../../components/store-site/shared/SiteMenu";
import useSiteCart from "../../../components/store-site/shared/useSiteCart";
import { getTemplateEntry } from "../../../components/store-site/template-registry";
import {
  IStoreSitePage,
  sitePagePath,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import {
  CART_PAGE_SLUG,
  siteCheckoutOf,
} from "../../../shared/business/store-sites/store-site-checkout";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  IPublicSiteProduct,
  IPublicStoreSite,
  TPublicSite,
} from "../../../shared/business/store-sites/store-sites.types";

interface Props {
  data: IPublicStoreSite;
  /** The page asked for; none is the home. */
  pageSlug?: string;
  /** The cart's own page, for a site whose cart is not a window. */
  isCartPage?: boolean;
}

/**
 * Picks the template of the site and gives it the visitor's cart. On a page
 * other than the home, its top says the page's own title: shorter, and
 * without the featured picture.
 */
const SiteClient = ({ data, pageSlug, isCartPage = false }: Props) => {
  const { store, products } = data;

  const labelOf = usePageLabel();

  const router = useRouter();

  const storedCart = useSiteCart(data.site.slug, products);

  const isCartAPage: boolean =
    siteCheckoutOf(data.site.checkout).look.mode ===
    StoreSitesEnum.CartMode.PAGE;

  const homeUrl: string = sitePagePath(data.site.slug);

  // A cart with a page of its own is opened by going there.
  const cart = useMemo(
    () =>
      isCartAPage
        ? {
            ...storedCart,
            open: () =>
              router.push(sitePagePath(data.site.slug, CART_PAGE_SLUG)),
          }
        : storedCart,
    [isCartAPage, storedCart, router, data.site.slug],
  );

  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const page: IStoreSitePage | null = pageSlug
    ? (sitePagesOf(data.site.pages).find(
        (candidate: IStoreSitePage) => candidate.slug === pageSlug,
      ) ?? null)
    : null;

  const site: TPublicSite = sitePageView(
    data.site,
    page,
    page ? labelOf(page) : "",
  );

  const { Component } = getTemplateEntry(site.templateId);

  // A site that sells nothing hides every "add" button with its cart.
  // Products can be only shown: then no "add" button either.
  const view: IStoreSiteCatalog = siteCatalogOf(site.catalog);
  const sells: boolean =
    siteCartButtonOf(site.cartButton).isVisible && view.isAddButtonShown;
  const images = siteImageStyleProps(site.imageStyle);

  return (
    <div
      className={`${base.salesWrap} ${sells ? "" : base.salesOff} ${
        view.isTitleShown ? "" : base.productsTitleOff
      } ${images.className}`}
      style={images.style}
    >
      {!isCartPage && <ScrollProgress color={site.theme.primary} />}
      {isCartPage ? (
        <SiteCart
          variant="page"
          slug={site.slug}
          theme={site.theme}
          products={products}
          cart={cart}
          checkout={site.checkout}
          onProductOpen={setOpenProductId}
          homeUrl={homeUrl}
          brandName={site.displayName?.trim() || store.name}
        />
      ) : (
        <Component
          site={site}
          store={store}
          products={products}
          mode="live"
          cart={cart}
          page={page}
          onProductOpen={view.isDetailsOpened ? setOpenProductId : undefined}
        />
      )}
      {!isCartPage && (
        <SiteStickyBar site={site} store={store} cart={cart} page={page} />
      )}
      <SiteProductModal
        product={
          products.find(
            (product: IPublicSiteProduct) => product._id === openProductId,
          ) ?? null
        }
        theme={site.theme}
        catalog={site.catalog}
        cart={cart}
        onClose={() => setOpenProductId(null)}
      />
      <SiteChatWidget
        slug={site.slug}
        chat={site.chat}
        theme={site.theme}
        brandName={site.displayName?.trim() || store.name}
      />
      {!isCartPage && !isCartAPage && (
        <SiteCart
          slug={site.slug}
          theme={site.theme}
          products={products}
          cart={cart}
          checkout={site.checkout}
          onProductOpen={setOpenProductId}
        />
      )}
    </div>
  );
};

export default SiteClient;
