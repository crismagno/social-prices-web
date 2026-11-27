"use client";

import { siteImageStyleProps } from "../../../components/store-site/shared/site-image-style";
import base from "../../../components/store-site/shared/site-base.module.css";
import { siteCartButtonOf } from "../../../shared/business/store-sites/store-site-cart-button";
import {
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../../shared/business/store-sites/store-site-catalog";
import { sitePageView } from "../../../components/store-site/shared/site-page-view";
import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import ScrollProgress from "../../../components/store-site/shared/ScrollProgress";
import SiteCart from "../../../components/store-site/shared/SiteCart";
import SiteProductModal from "../../../components/store-site/shared/SiteProductModal";
import SiteChatWidget from "../../../components/store-site/shared/SiteChatWidget";
import SitePageTop from "../../../components/store-site/shared/SitePageTop";
import pageStyles from "../../../components/store-site/shared/SitePageTop.module.css";
import SiteThemeVars from "../../../components/store-site/shared/SiteThemeVars";
import useSiteT from "../../../components/store-site/shared/useSiteT";
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
  PRODUCT_PAGE_SLUG,
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
  /** A product's own page, for a site whose products open as pages. */
  productId?: string;
}

/**
 * Picks the template of the site and gives it the visitor's cart. On a page
 * other than the home, its top says the page's own title: shorter, and
 * without the featured picture.
 */
const SiteClient = ({
  data,
  pageSlug,
  isCartPage = false,
  productId,
}: Props) => {
  const { store, products } = data;

  const labelOf = usePageLabel();

  const router = useRouter();

  const storedCart = useSiteCart(data.site.slug, products);

  const isCartAPage: boolean =
    siteCheckoutOf(data.site.checkout).look.mode ===
    StoreSitesEnum.CartMode.PAGE;

  const homeUrl: string = sitePagePath(data.site.slug);

  // Back from a product: to the page of products when the site has one.
  const productsSlug: string | undefined = sitePagesOf(data.site.pages).find(
    (candidate: IStoreSitePage) =>
      candidate.type === StoreSitesEnum.SitePageType.PRODUCTS,
  )?.slug;

  const productsUrl: string = sitePagePath(data.site.slug, productsSlug);

  const t = useSiteT();

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

  const brandName: string = site.displayName?.trim() || store.name;

  // A product of the page it was asked for, on its own page.
  const pageProduct: IPublicSiteProduct | null = productId
    ? (products.find(
        (product: IPublicSiteProduct) => product._id === productId,
      ) ?? null)
    : null;

  const isOwnPage: boolean = isCartPage || !!pageProduct;

  // A site that sells nothing hides every "add" button with its cart.
  // Products can be only shown: then no "add" button either.
  const view: IStoreSiteCatalog = siteCatalogOf(site.catalog);
  const sells: boolean =
    siteCartButtonOf(site.cartButton).isVisible && view.isAddButtonShown;
  const images = siteImageStyleProps(site.imageStyle);

  // Products with pages of their own are opened by going there.
  const openProduct = (id: string): void => {
    if (view.detailsMode === StoreSitesEnum.ProductDetailsMode.PAGE) {
      router.push(
        `${sitePagePath(site.slug, PRODUCT_PAGE_SLUG)}/${encodeURIComponent(id)}`,
      );
    } else {
      setOpenProductId(id);
    }
  };

  return (
    <div
      className={`${base.salesWrap} ${sells ? "" : base.salesOff} ${
        view.isTitleShown ? "" : base.productsTitleOff
      } ${images.className}`}
      style={images.style}
    >
      {!isOwnPage && <ScrollProgress color={site.theme.primary} />}
      {pageProduct ? (
        <SiteThemeVars theme={site.theme} className={pageStyles.page}>
          <SitePageTop
            homeUrl={homeUrl}
            brandName={brandName}
            backUrl={productsUrl}
            backLabel={t("storeSite.cart.keepShopping")}
            cart={sells ? cart : null}
          />
          <SiteProductModal
            variant="page"
            product={pageProduct}
            theme={site.theme}
            catalog={site.catalog}
            cart={cart}
            onClose={() => router.push(productsUrl)}
          />
        </SiteThemeVars>
      ) : isCartPage ? (
        <SiteCart
          variant="page"
          slug={site.slug}
          theme={site.theme}
          products={products}
          cart={cart}
          checkout={site.checkout}
          onProductOpen={openProduct}
          homeUrl={homeUrl}
          brandName={brandName}
        />
      ) : (
        <Component
          site={site}
          store={store}
          products={products}
          mode="live"
          cart={cart}
          page={page}
          onProductOpen={view.isDetailsOpened ? openProduct : undefined}
        />
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
        brandName={brandName}
      />
      {!isCartPage && !isCartAPage && (
        <SiteCart
          slug={site.slug}
          theme={site.theme}
          products={products}
          cart={cart}
          checkout={site.checkout}
          onProductOpen={openProduct}
        />
      )}
    </div>
  );
};

export default SiteClient;
