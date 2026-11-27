import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPublicStoreSite } from "../../../../services/social-prices-api/store-sites/store-sites-public.fetch";
import { IPublicStoreSite } from "../../../../shared/business/store-sites/store-sites.types";
import SiteClient from "../SiteClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  if (!data) {
    return { title: "Site" };
  }

  const brandName: string = data.site.displayName?.trim() || data.store.name;

  // The server has no visitor language yet: the word stores use, in Portuguese.
  return {
    title: `Carrinho · ${brandName}`,
    robots: { index: false },
  };
}

/** The cart of a store's site as a page of its own, when the owner chose it. */
export default async function SiteCartPage({ params }: Props) {
  const { slug } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  if (!data) {
    notFound();
  }

  return <SiteClient data={data} isCartPage />;
}
