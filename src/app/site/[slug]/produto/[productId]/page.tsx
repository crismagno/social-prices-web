import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPublicStoreSite } from "../../../../../services/social-prices-api/store-sites/store-sites-public.fetch";
import {
  IPublicSiteProduct,
  IPublicStoreSite,
} from "../../../../../shared/business/store-sites/store-sites.types";
import { getImageUrl } from "../../../../../shared/utils/images/images-url";
import SiteClient from "../../SiteClient";

interface Props {
  params: Promise<{ slug: string; productId: string }>;
}

const findProduct = (
  data: IPublicStoreSite,
  productId: string,
): IPublicSiteProduct | undefined =>
  data.products.find(
    (product: IPublicSiteProduct) =>
      product._id === decodeURIComponent(productId),
  );

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  const product: IPublicSiteProduct | undefined = data
    ? findProduct(data, productId)
    : undefined;

  if (!data || !product) {
    return { title: "Site" };
  }

  const brandName: string = data.site.displayName?.trim() || data.store.name;

  const title: string = `${product.name} · ${brandName}`;

  const description: string | undefined =
    product.description ?? product.details ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.mainUrl ? [getImageUrl(product.mainUrl)] : undefined,
    },
  };
}

/** A product of a store's site on its own page, when the owner chose it. */
export default async function SiteProductPage({ params }: Props) {
  const { slug, productId } = await params;

  const data: IPublicStoreSite | null = await fetchPublicStoreSite(slug);

  // Only what the site shows: a product off the site is not found here either.
  if (!data || !findProduct(data, productId)) {
    notFound();
  }

  return <SiteClient data={data} productId={decodeURIComponent(productId)} />;
}
