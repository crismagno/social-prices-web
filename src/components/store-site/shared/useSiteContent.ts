import { IStoreSiteSection } from "../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi, IStoreSiteTemplateProps } from "../template.types";
import { featuredSlideKeys, heroSlideKeys } from "./HeroBackground";
import { cssUrl, siteLogo } from "./site-format";
import { TSiteTranslate } from "./useSiteT";

export interface ISiteContent {
  /** Only the blocks switched on. */
  sections: IStoreSiteSection[];
  /** Empty when the strip is off or has nothing to say. */
  marqueeItems: string[];
  backgroundImage: string | undefined;
  featuredImage: string | undefined;
  /** The picture at the top: the site's own, else the store's; null when hidden. */
  logo: string | null;
  /** The name at the top: the site's own, else the store's. */
  brandName: string;
}

/** What every template asks of the content, answered once. */
export const getSiteContent = ({
  site,
  store,
}: Pick<IStoreSiteTemplateProps, "site" | "store">): ISiteContent => ({
  sections: site.sections.filter(
    (section: IStoreSiteSection) => section.isActive,
  ),
  marqueeItems: site.marquee.isActive
    ? site.marquee.items.filter((item: string) => item.trim())
    : [],
  backgroundImage: cssUrl(heroSlideKeys(site.hero)[0]),
  featuredImage: cssUrl(featuredSlideKeys(site.hero)[0]),
  logo: siteLogo(site.logo, store.logo),
  brandName: site.displayName?.trim() || store.name,
});

/** What the "add" button of a product says, given the stock and the cart. */
export const addLabel = (
  product: IPublicSiteProduct,
  cart: ISiteCartApi,
  t: TSiteTranslate,
): string => {
  if (!product.isAvailable) {
    return t("storeSite.public.unavailable");
  }

  const inCart: number = cart.quantityOf(product._id);

  return inCart > 0
    ? t("storeSite.public.inCart", { count: inCart })
    : t("storeSite.public.add");
};

/** The phrases of the strip, repeated enough to fill and loop seamlessly. */
export const repeatForMarquee = (items: string[]): string[] => {
  if (!items.length) {
    return [];
  }

  const copies: number = Math.max(2, Math.ceil(12 / items.length)) * 2;

  return Array.from({ length: copies }).flatMap(() => items);
};
