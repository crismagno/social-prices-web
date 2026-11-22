"use client";

import ScrollProgress from "../../../components/store-site/shared/ScrollProgress";
import SiteCart from "../../../components/store-site/shared/SiteCart";
import { usePageLabel } from "../../../components/store-site/shared/SiteMenu";
import useSiteCart from "../../../components/store-site/shared/useSiteCart";
import { getTemplateEntry } from "../../../components/store-site/template-registry";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import {
  IPublicStoreSite,
  TPublicSite,
} from "../../../shared/business/store-sites/store-sites.types";

interface Props {
  data: IPublicStoreSite;
  /** The page asked for; none is the home. */
  pageSlug?: string;
}

/** How tall the top of a page other than the home is. */
const PAGE_TOP_HEIGHT = 440;

/**
 * Picks the template of the site and gives it the visitor's cart. On a page
 * other than the home, its top says the page's own title: shorter, and
 * without the featured picture.
 */
const SiteClient = ({ data, pageSlug }: Props) => {
  const { store, products } = data;

  const labelOf = usePageLabel();

  const cart = useSiteCart(data.site.slug, products);

  const page: IStoreSitePage | null = pageSlug
    ? (sitePagesOf(data.site.pages).find(
        (candidate: IStoreSitePage) => candidate.slug === pageSlug,
      ) ?? null)
    : null;

  const site: TPublicSite = page
    ? {
        ...data.site,
        hero: {
          ...data.site.hero,
          tagline: null,
          title: page.title?.trim() || labelOf(page),
          subtitle: page.intro,
          featuredImageUrl: null,
          featuredImageUrls: [],
        },
        sizes: { ...data.site.sizes, heroHeight: PAGE_TOP_HEIGHT },
        // The strip and the blocks belong to the home.
        sections: [],
        marquee: { ...data.site.marquee, isActive: false },
      }
    : data.site;

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
        page={page}
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
