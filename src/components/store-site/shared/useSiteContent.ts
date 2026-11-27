import {
  IStoreSiteBlock,
  IStoreSiteBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import { IStoreSiteAbout } from "../../../shared/business/store-sites/store-site-about";
import { heroOptionsOf } from "../../../shared/business/store-sites/store-site-hero";
import { siteMarqueeStyleOf } from "../../../shared/business/store-sites/store-site-marquee-style";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteSection } from "../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi, IStoreSiteTemplateProps } from "../template.types";
import { featuredSlideKeys, heroSlideKeys } from "./HeroBackground";
import { cssUrl, siteLogo } from "./site-format";
import { TSiteTranslate } from "./useSiteT";

export interface ISiteContent {
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
  backgroundImage: cssUrl(heroSlideKeys(site.hero)[0]),
  // Hidden by the owner: the entrance is drawn as one without a picture.
  featuredImage: heroOptionsOf(site.hero.options).isFeaturedVisible
    ? cssUrl(featuredSlideKeys(site.hero)[0])
    : undefined,
  logo: siteLogo(site.logo, store.logo),
  brandName: site.displayName?.trim() || store.name,
});

/** What the "add" button of a product says, given the stock and the cart. */
export const addLabel = (
  product: IPublicSiteProduct,
  cart: ISiteCartApi,
  t: TSiteTranslate,
  /** The owner's own text of the button, when they wrote one. */
  ownLabel?: string | null,
): string => {
  if (!product.isAvailable) {
    return t("storeSite.public.unavailable");
  }

  const inCart: number = cart.quantityOf(product._id);

  return inCart > 0
    ? t("storeSite.public.inCart", { count: inCart })
    : ownLabel || t("storeSite.public.add");
};

/** The phrases of the strip, repeated enough to fill and loop seamlessly. */
export const repeatForMarquee = (items: string[]): string[] => {
  if (!items.length) {
    return [];
  }

  const copies: number = Math.max(2, Math.ceil(12 / items.length)) * 2;

  return Array.from({ length: copies }).flatMap(() => items);
};

/** What a strip or a set of cards shows: the block's own, or the site's. */
export interface ISitePartView {
  sections: IStoreSiteSection[];
  marqueeItems: string[];
  /** Between the phrases; empty, the template's own symbol. */
  marqueeSeparator: string | null;
  /** A text with media: its title, its paragraphs and its image or video. */
  about: Partial<IStoreSiteAbout> | null | undefined;
}

/**
 * What the template draws for one strip or one set of cards. A block with
 * content of its own shows it; one placed before blocks had any (or a page
 * its owner never arranged) shows what the site has for all of them.
 */
export const sitePartView = (
  site: IStoreSiteTemplateProps["site"],
  block?: IStoreSiteBlock | null,
): ISitePartView => {
  const isOwn: boolean = block?.settings.isOwn === true;
  const T = StoreSitesEnum.BlockType;

  return {
    sections:
      isOwn && block?.type === T.CARDS
        ? block.items
            .filter((item: IStoreSiteBlockItem) => !!item.title?.trim())
            .map((item: IStoreSiteBlockItem) => ({
              key: item.key,
              title: item.title ?? "",
              description: item.text,
              imageUrl: item.imageUrl,
              isActive: true,
            }))
        : site.sections.filter(
            (section: IStoreSiteSection) => section.isActive,
          ),
    marqueeItems:
      isOwn && block?.type === T.MARQUEE
        ? block.items
            .map((item: IStoreSiteBlockItem) => item.title?.trim() ?? "")
            .filter(Boolean)
        : site.marquee.isActive
          ? site.marquee.items.filter((item: string) => item.trim())
          : [],
    about:
      isOwn && block?.type === T.ABOUT
        ? {
            isActive: true,
            title: block.title,
            texts: block.items
              .map((item: IStoreSiteBlockItem) => item.text ?? "")
              .filter((text: string) => text.trim()),
            media: block.settings.media,
            mediaPosition:
              block.settings.mediaPosition ??
              StoreSitesEnum.AboutMediaPosition.LEFT,
          }
        : site.about,
    marqueeSeparator: siteMarqueeStyleOf(
      isOwn && block?.type === T.MARQUEE
        ? block.settings.marquee
        : site.marqueeStyle,
    ).separator,
  };
};
