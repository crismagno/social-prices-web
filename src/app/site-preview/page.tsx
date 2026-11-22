"use client";

import { useEffect, useState } from "react";

import {
  IPreviewData,
  IPreviewMessage,
  PREVIEW_DATA,
  PREVIEW_READY,
} from "../../components/store-site/preview-channel";
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

  return (
    <Component
      site={data.site}
      store={data.store}
      products={data.products}
      mode="preview"
      cart={NO_CART}
    />
  );
}
