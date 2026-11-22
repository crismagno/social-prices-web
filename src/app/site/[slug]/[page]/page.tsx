import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPublicStoreSite } from "../../../../services/social-prices-api/store-sites/store-sites-public.fetch";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { IPublicStoreSite } from "../../../../shared/business/store-sites/store-sites.types";
import SiteClient from "../SiteClient";

// The server has no visitor language yet: the names stores use, in Portuguese.
const READY_PAGE_NAMES: Partial<Record<StoreSitesEnum.SitePageType, string>> = {
  [StoreSitesEnum.SitePageType.PRODUCTS]: "Produtos",
  [StoreSitesEnum.SitePageType.ABOUT]: "Sobre",
  [StoreSitesEnum.SitePageType.SUPPORT]: "Suporte",
};

interface Props {
  params: Promise<{ slug: string; page: string }>;
}

const findPage = (
  data: IPublicStoreSite,
  pageSlug: string,
): IStoreSitePage | undefined =>
  sitePagesOf(data.site.pages).find(
    (page: IStoreSitePage) => page.slug === decodeURIComponent(pageSlug),
  );

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page: pageSlug } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  const page: IStoreSitePage | undefined = data
    ? findPage(data, pageSlug)
    : undefined;

  if (!data || !page) {
    return { title: "Site" };
  }

  const brandName: string = data.site.displayName?.trim() || data.store.name;

  const pageName: string =
    page.title?.trim() ||
    page.label?.trim() ||
    READY_PAGE_NAMES[page.type] ||
    page.slug;

  return {
    title: `${pageName} · ${brandName}`,
    description: page.intro ?? data.site.hero.subtitle ?? undefined,
  };
}

/** A page of a store's site besides its home: products, about, support or the owner's own. */
export default async function SitePagePage({ params }: Props) {
  const { slug, page: pageSlug } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  if (!data || !findPage(data, pageSlug)) {
    notFound();
  }

  return <SiteClient data={data} pageSlug={decodeURIComponent(pageSlug)} />;
}
