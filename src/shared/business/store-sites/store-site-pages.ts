import Urls from "../../common/routes-app/routes-app";
import { IStoreSiteAboutMedia } from "./store-site-about";
import StoreSitesEnum from "./store-sites.enum";

export interface IStoreSiteFaqItem {
  question: string;
  answer: string;
}

/** What a page shows below its title: texts and an image or a video. */
export interface IStoreSitePageContent {
  texts: string[];
  media: IStoreSiteAboutMedia | null;
  mediaPosition: StoreSitesEnum.AboutMediaPosition;
}

/**
 * A page of the site besides its home, at /site/<site>/<slug>. Its place in
 * the list is its place in the menu.
 */
export interface IStoreSitePage {
  key: string;
  type: StoreSitesEnum.SitePageType;
  slug: string;
  /** The name in the menu; empty, the site names it by its kind. */
  label: string | null;
  isInMenu: boolean;
  /** The title at the top of the page; empty, the name in the menu. */
  title: string | null;
  /** A line under the title. */
  intro: string | null;
  content: IStoreSitePageContent;
  /** Questions and answers: only the support page has them. */
  faq: IStoreSiteFaqItem[];
}

export const PAGE_SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/;

const READY_PAGES: { type: StoreSitesEnum.SitePageType; isInMenu: boolean }[] =
  [
    { type: StoreSitesEnum.SitePageType.PRODUCTS, isInMenu: true },
    { type: StoreSitesEnum.SitePageType.ABOUT, isInMenu: true },
    { type: StoreSitesEnum.SitePageType.SUPPORT, isInMenu: false },
  ];

export const emptyPageContent = (): IStoreSitePageContent => ({
  texts: [],
  media: null,
  mediaPosition: StoreSitesEnum.AboutMediaPosition.LEFT,
});

const readyPage = (
  type: StoreSitesEnum.SitePageType,
  isInMenu: boolean,
): IStoreSitePage => ({
  key: type.toLowerCase(),
  type,
  slug: StoreSitesEnum.READY_PAGE_SLUGS[
    type as keyof typeof StoreSitesEnum.READY_PAGE_SLUGS
  ],
  label: null,
  isInMenu,
  title: null,
  intro: null,
  content: emptyPageContent(),
  faq: [],
});

/**
 * The pages of a site. One saved before pages existed gets the ready ones;
 * after that the owner decides, and a ready page can be removed. The API
 * checks everything else when saving.
 */
export const sitePagesOf = (
  pages: IStoreSitePage[] | null | undefined,
): IStoreSitePage[] => {
  if (!Array.isArray(pages)) {
    return READY_PAGES.map((ready) => readyPage(ready.type, ready.isInMenu));
  }

  return pages
    .filter((page: IStoreSitePage) => !!page && typeof page.type === "string")
    .map((page: IStoreSitePage) => ({
      ...page,
      content: page.content ?? emptyPageContent(),
      faq: page.faq ?? [],
    }));
};

/** A ready page as a new site has it, to add back one that was removed. */
export const newReadyPage = (
  type: StoreSitesEnum.SitePageType,
): IStoreSitePage =>
  readyPage(
    type,
    READY_PAGES.find((ready) => ready.type === type)?.isInMenu ?? true,
  );

/** The ready pages a site does not have (the owner removed them). */
export const missingReadyPages = (
  pages: IStoreSitePage[],
): StoreSitesEnum.SitePageType[] =>
  READY_PAGES.map((ready) => ready.type).filter(
    (type: StoreSitesEnum.SitePageType) =>
      !pages.some((page: IStoreSitePage) => page.type === type),
  );

export const slugifyPage = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");

/** The address of a page of the site; without a page, its home. */
export const sitePagePath = (
  siteSlug: string,
  pageSlug?: string | null,
): string => {
  const home: string = Urls.SITE.replace(":slug", encodeURIComponent(siteSlug));

  return pageSlug ? `${home}/${encodeURIComponent(pageSlug)}` : home;
};

/**
 * Where "see the products" or "about" leads from a page that does not show
 * them: their own page if the site has it, else that part of the home.
 */
export const readyPageHref = (
  siteSlug: string,
  pages: IStoreSitePage[] | null | undefined,
  type: StoreSitesEnum.SitePageType,
  homeAnchor: string,
): string => {
  const page: IStoreSitePage | undefined = sitePagesOf(pages).find(
    (candidate: IStoreSitePage) => candidate.type === type,
  );

  return page
    ? sitePagePath(siteSlug, page.slug)
    : `${sitePagePath(siteSlug)}#${homeAnchor}`;
};

/** What each page of the site shows of the parts the home has. */
export const pageShows = (
  page: Pick<IStoreSitePage, "type"> | null | undefined,
): { products: boolean; about: boolean } => ({
  products: !page || page.type === StoreSitesEnum.SitePageType.PRODUCTS,
  about: !page || page.type === StoreSitesEnum.SitePageType.ABOUT,
});

/**
 * The keys of the pages of the owner whose address cannot be used: not a
 * valid address, the address of a ready page, or one another page has.
 */
export const invalidPageKeys = (pages: IStoreSitePage[]): string[] => {
  const ready: string[] = Object.values(StoreSitesEnum.READY_PAGE_SLUGS);
  const seen: Set<string> = new Set();

  return pages
    .filter(
      (page: IStoreSitePage) =>
        page.type === StoreSitesEnum.SitePageType.CUSTOM,
    )
    .filter((page: IStoreSitePage) => {
      const isBad: boolean =
        !PAGE_SLUG_REGEX.test(page.slug) ||
        ready.includes(page.slug) ||
        seen.has(page.slug);

      seen.add(page.slug);

      return isBad;
    })
    .map((page: IStoreSitePage) => page.key);
};
