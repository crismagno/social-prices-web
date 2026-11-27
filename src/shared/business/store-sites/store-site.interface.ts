import { IStoreSiteAbout } from "./store-site-about";
import { IStoreSiteBackdrop } from "./store-site-backdrop";
import { IStoreSiteBlock } from "./store-site-blocks";
import { IStoreSiteCatalog } from "./store-site-catalog";
import { IStoreSiteChat } from "./store-site-chat";
import { IStoreSiteCartButton } from "./store-site-cart-button";
import { IStoreSiteImageStyle } from "./store-site-image-style";
import { IStoreSiteCheckout } from "./store-site-checkout";
import { IStoreSiteHeader } from "./store-site-header";
import { IStoreSiteMarqueeStyle } from "./store-site-marquee-style";
import { IStoreSiteFonts } from "./store-site-fonts";
import { IStoreSiteFooter } from "./store-site-footer";
import { IStoreSiteHeroOptions } from "./store-site-hero";
import { IStoreSitePage } from "./store-site-pages";
import { IStoreSiteSignIn } from "./store-site-sign-in";
import { TStoreSiteSizes } from "./store-site-sizes";
import StoreSitesEnum from "./store-sites.enum";

/** Hex colors (#rrggbb). Every template reads the same five. */
export interface IStoreSiteTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface IStoreSiteHero {
  tagline: string | null;
  title: string;
  subtitle: string | null;
  backgroundImageUrl: string | null;
  /** More backgrounds: with any, the entrance changes from one to the next. */
  backgroundImageUrls?: string[];
  /** Seconds each background stays, when there is more than one. */
  slideSeconds?: number;
  featuredImageUrl: string | null;
  /** More featured images: with any, they take turns. */
  featuredImageUrls?: string[];
  /** Seconds each featured image stays, when there is more than one. */
  featuredSlideSeconds?: number;
  ctaLabel: string | null;
  /** What the owner changed of how the entrance looks and what it says. */
  options?: Partial<IStoreSiteHeroOptions>;
}

export interface IStoreSiteSection {
  key: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

/**
 * The logo shown on the site. Without an image of its own it is the logo of
 * the store; switched off, the site shows none.
 */
export interface IStoreSiteLogo {
  isActive: boolean;
  imageUrl: string | null;
}

export interface IStoreSiteMarquee {
  isActive: boolean;
  items: string[];
}

/** What the owner edits: the same content whatever the template. */
export interface ISaveStoreSite {
  slug: string;
  templateId: StoreSitesEnum.Template;
  theme: IStoreSiteTheme;
  /** The name shown at the top of the site; empty means the store's name. */
  displayName: string | null;
  /** Sizes the owner set, in pixels; an empty one is the template's own. */
  sizes: TStoreSiteSizes;
  footer: IStoreSiteFooter;
  signIn: IStoreSiteSignIn;
  catalog: IStoreSiteCatalog;
  about: IStoreSiteAbout;
  pages: IStoreSitePage[];
  chat: IStoreSiteChat;
  blocks: IStoreSiteBlock[];
  /** How the top behaves while the visitor scrolls. */
  header: IStoreSiteHeader;
  /** The cart button, or none for a site that sells nothing. */
  cartButton: IStoreSiteCartButton;
  /** The shape and proportion of the images, by place. */
  imageStyle: IStoreSiteImageStyle;
  /** What the bag asks before an order is sent. */
  checkout: IStoreSiteCheckout;
  /** How the strip of phrases looks and runs. */
  marqueeStyle: IStoreSiteMarqueeStyle;
  /** The typefaces, when the owner changed the template's. */
  fonts: IStoreSiteFonts;
  /** What lies behind the whole site; a page can have its own. */
  backdrop: IStoreSiteBackdrop;
  /** The owner arranged the pages: only the blocks list says what shows where. */
  isLayoutCustom: boolean;
  hero: IStoreSiteHero;
  sections: IStoreSiteSection[];
  marquee: IStoreSiteMarquee;
  logo: IStoreSiteLogo;
  productIds: string[];
}

export interface IStoreSite extends ISaveStoreSite {
  _id: string;
  userId: string;
  storeId: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
