"use client";

import SiteStickyBar from "../../components/store-site/shared/SiteStickyBar";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import { sitePageView } from "../../components/store-site/shared/site-page-view";
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
  const isBuilding: boolean = !!data?.builder;

  const builder: ISectionBuilderHooks | undefined = useMemo(
    () =>
      isBuilding
        ? {
            selectedKey,
            send,
            labelOf: (type: StoreSitesEnum.BlockType) =>
              t(`storeSite.editor.builder.types.${type}`),
          }
        : undefined,
    [isBuilding, selectedKey, send, t],
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

  return (
    <>
      <SiteStickyBar
          site={data.site}
          store={data.store}
          cart={NO_CART}
          page={page}
        />
    <Component
      site={sitePageView(data.site, page, page ? labelOfPage(page) : "")}
      page={page}
      builder={builder}
      store={data.store}
      products={data.products}
      mode="preview"
      cart={NO_CART}
    />
    </>
  );
}
