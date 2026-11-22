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

export interface IStoreSiteMarquee {
  isActive: boolean;
  items: string[];
}

/** What the owner edits: the same content whatever the template. */
export interface ISaveStoreSite {
  slug: string;
  templateId: StoreSitesEnum.Template;
  theme: IStoreSiteTheme;
  hero: IStoreSiteHero;
  sections: IStoreSiteSection[];
  marquee: IStoreSiteMarquee;
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
