import { IStoreSiteFooter } from "./store-site-footer";
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
  featuredImageUrl: string | null;
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
