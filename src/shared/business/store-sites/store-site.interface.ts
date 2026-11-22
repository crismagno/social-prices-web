import { IStoreSiteAbout } from "./store-site-about";
import { IStoreSiteFooter } from "./store-site-footer";
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
  about: IStoreSiteAbout;
  pages: IStoreSitePage[];
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
