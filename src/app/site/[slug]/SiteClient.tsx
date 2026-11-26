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
import { useState } from "react";

import ScrollProgress from "../../../components/store-site/shared/ScrollProgress";
import SiteCart from "../../../components/store-site/shared/SiteCart";
import SiteProductModal from "../../../components/store-site/shared/SiteProductModal";
import SiteChatWidget from "../../../components/store-site/shared/SiteChatWidget";
import { usePageLabel } from "../../../components/store-site/shared/SiteMenu";
import useSiteCart from "../../../components/store-site/shared/useSiteCart";
import { getTemplateEntry } from "../../../components/store-site/template-registry";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import {
  IPublicSiteProduct,
  IPublicStoreSite,
  TPublicSite,
} from "../../../shared/business/store-sites/store-sites.types";

interface Props {
  data: IPublicStoreSite;
  /** The page asked for; none is the home. */
  pageSlug?: string;
}

/**
 * Picks the template of the site and gives it the visitor's cart. On a page
 * other than the home, its top says the page's own title: shorter, and
 * without the featured picture.
 */
const SiteClient = ({ data, pageSlug }: Props) => {
  const { store, products } = data;

  const labelOf = usePageLabel();

  const cart = useSiteCart(data.site.slug, products);

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
    <div className={`${base.salesWrap} ${sells ? "" : base.salesOff} ${
        view.isTitleShown ? "" : base.productsTitleOff
      } ${images.className}`}
      style={images.style}>
      <ScrollProgress color={site.theme.primary} />
      <Component
        site={site}
        store={store}
        products={products}
        mode="live"
        cart={cart}
        page={page}
        onProductOpen={view.isDetailsOpened ? setOpenProductId : undefined}
      />
      <SiteStickyBar site={site} store={store} cart={cart} page={page} />
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
      <SiteCart
        slug={site.slug}
        theme={site.theme}
        products={products}
        cart={cart}
        checkout={site.checkout}
        onProductOpen={setOpenProductId}
      />
    </div>
  );
};

export default SiteClient;
