"use client";

import { siteImageStyleProps } from "../../components/store-site/shared/site-image-style";
import {
  IStoreSitePage,
  sitePagePath,
  sitePagesOf,
} from "../../shared/business/store-sites/store-site-pages";
import SiteBackdrop from "../../components/store-site/shared/SiteBackdrop";
import SiteChatWidget from "../../components/store-site/shared/SiteChatWidget";
import SiteFonts from "../../components/store-site/shared/SiteFonts";
import base from "../../components/store-site/shared/site-base.module.css";
import {
  backdropOfPage,
  hasBackdrop,
  IStoreSiteBackdrop,
} from "../../shared/business/store-sites/store-site-backdrop";
import { siteCartButtonOf } from "../../shared/business/store-sites/store-site-cart-button";
import {
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../shared/business/store-sites/store-site-catalog";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  IPreviewData,
  IPreviewMessage,
  PREVIEW_BUILDER,
  PREVIEW_DATA,
  PREVIEW_READY,
} from "../../components/store-site/preview-channel";
import { usePageLabel } from "../../components/store-site/shared/SiteMenu";
import {
  ISectionBuilderHooks,
  TBuilderAction,
} from "../../components/store-site/shared/blocks/builder-types";
import {
  sitePageView,
  withBackdropEntrance,
} from "../../components/store-site/shared/site-page-view";
import useSiteT from "../../components/store-site/shared/useSiteT";
import StoreSitesEnum from "../../shared/business/store-sites/store-sites.enum";
import { getTemplateEntry } from "../../components/store-site/template-registry";
import { ISiteCartApi } from "../../components/store-site/template.types";

const NO_CART: ISiteCartApi = {
  count: 0,
  quantityOf: () => 0,
  add: () => undefined,
  open: () => undefined,
};

/**
 * The frame the editor shows the draft in. It holds no data of its own: it
 * draws whatever the editor (same origin) sends, and nothing in it is live.
 */
export default function SitePreviewPage() {
  const [data, setData] = useState<IPreviewData | null>(null);

  const t = useSiteT();
  const labelOfPage = usePageLabel();

  // What the owner does on a section goes to the editor, which owns the draft.
  const send = useCallback((action: TBuilderAction): void => {
    window.parent?.postMessage(
      { type: PREVIEW_BUILDER, action } as IPreviewMessage,
      window.location.origin,
    );
  }, []);

  const selectedKey: string | null = data?.builder?.selectedKey ?? null;
  const selectedElementKey: string | null =
    data?.builder?.selectedElementKey ?? null;
  const isBuilding: boolean = !!data?.builder;

  const builder: ISectionBuilderHooks | undefined = useMemo(
    () =>
      isBuilding
        ? {
            selectedKey,
            selectedElementKey,
            send,
            labelOf: (type: StoreSitesEnum.BlockType) =>
              t(`storeSite.editor.builder.types.${type}`),
          }
        : undefined,
    [isBuilding, selectedKey, selectedElementKey, send, t],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent<IPreviewMessage>): void => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === PREVIEW_DATA && event.data.data) {
        setData(event.data.data);
      }
    };

    window.addEventListener("message", onMessage);

    window.parent?.postMessage(
      { type: PREVIEW_READY } as IPreviewMessage,
      window.location.origin,
    );

    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!data) {
    return null;
  }

  const { Component } = getTemplateEntry(data.site.templateId);

  const page = data.page ?? null;

  // Products can be only shown: then no "add" button either.
  const view: IStoreSiteCatalog = siteCatalogOf(data.site.catalog);
  const sells: boolean =
    siteCartButtonOf(data.site.cartButton).isVisible && view.isAddButtonShown;
  const images = siteImageStyleProps(data.site.imageStyle);

  // The page as it is drawn: its colours, and what lies behind it.
  const pageView = sitePageView(data.site, page, page ? labelOfPage(page) : "");

  const backdrop: IStoreSiteBackdrop = backdropOfPage(
    data.site.backdrop,
    page?.backdrop,
  );
  const showsBackdrop: boolean = hasBackdrop(backdrop);

  // A link to a page of the site never leaves the editor: the editor shows
  // that page in the preview instead.
  const followPageLink = (event: MouseEvent<HTMLDivElement>): void => {
    const link = (event.target as HTMLElement).closest?.("a");
    const href: string | null = link?.getAttribute("href") ?? null;
    const home: string = sitePagePath(data.site.slug);

    if (!href || !(href === home || href.startsWith(`${home}/`))) {
      return;
    }

    event.preventDefault();

    const pageSlug: string = decodeURIComponent(
      href.slice(home.length).replace(/^\//, "").split(/[/?#]/)[0] ?? "",
    );

    const target: IStoreSitePage | undefined = pageSlug
      ? sitePagesOf(data.site.pages).find(
          (candidate: IStoreSitePage) => candidate.slug === pageSlug,
        )
      : undefined;

    if (pageSlug && !target) {
      return;
    }

    send({ kind: "page", pageKey: target?.key ?? null });
  };

  return (
    <SiteFonts fonts={data.site.fonts}>
      <div
        className={`${base.salesWrap} ${sells ? "" : base.salesOff} ${
          view.isTitleShown ? "" : base.productsTitleOff
        } ${images.className} ${showsBackdrop ? base.backdropOn : ""}`}
        style={images.style}
        onClickCapture={followPageLink}
      >
        {showsBackdrop && (
          <SiteBackdrop backdrop={backdrop} color={pageView.theme.background} />
        )}
        <Component
          site={showsBackdrop ? withBackdropEntrance(pageView, page) : pageView}
          page={page}
          builder={builder}
          store={data.store}
          products={data.products}
          mode="preview"
          cart={NO_CART}
        />
        <SiteChatWidget
          slug={data.site.slug}
          chat={data.site.chat}
          theme={data.site.theme}
          brandName={data.site.displayName?.trim() || data.store.name}
          isPreview
        />
      </div>
    </SiteFonts>
  );
}
