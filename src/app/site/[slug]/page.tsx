import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPublicStoreSite } from "../../../services/social-prices-api/store-sites/store-sites-public.fetch";
import { IPublicStoreSite } from "../../../shared/business/store-sites/store-sites.types";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import SiteClient from "./SiteClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  if (!data) {
    return { title: "Site" };
  }

  const title: string = `${data.site.hero.title} · ${data.store.name}`;

  const description: string | undefined =
    data.site.hero.subtitle ?? data.store.description ?? undefined;

  const imageKey: string | null =
    data.site.hero.backgroundImageUrl ?? data.store.logo;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: imageKey ? [getImageUrl(imageKey)] : undefined,
    },
  };
}

/** The storefront of one store, open to anyone: no login, no panel layout. */
export default async function SitePage({ params }: Props) {
  const { slug } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  if (!data) {
    notFound();
  }

  return <SiteClient data={data} />;
}
