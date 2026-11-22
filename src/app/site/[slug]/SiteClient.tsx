"use client";

import ScrollProgress from "../../../components/store-site/shared/ScrollProgress";
import SiteCart from "../../../components/store-site/shared/SiteCart";
import useSiteCart from "../../../components/store-site/shared/useSiteCart";
import { getTemplateEntry } from "../../../components/store-site/template-registry";
import { IPublicStoreSite } from "../../../shared/business/store-sites/store-sites.types";

interface Props {
  data: IPublicStoreSite;
}

/** Picks the template of the site and gives it the visitor's cart. */
const SiteClient = ({ data }: Props) => {
  const { site, store, products } = data;

  const cart = useSiteCart(site.slug, products);

  const { Component } = getTemplateEntry(site.templateId);

  return (
    <>
      <ScrollProgress color={site.theme.primary} />
      <Component
        site={site}
        store={store}
        products={products}
        mode="live"
        cart={cart}
      />
      <SiteCart
        slug={site.slug}
        theme={site.theme}
        products={products}
        cart={cart}
      />
    </>
  );
};

export default SiteClient;
