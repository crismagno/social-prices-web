import { IStoreSiteTemplateProps } from "../template.types";

/** How tall the top of a page other than the home is. */
export const PAGE_TOP_HEIGHT = 440;

type TSite = IStoreSiteTemplateProps["site"];

/**
 * The site as one of its pages shows it: the top says the page's own title,
 * shorter and without the featured picture. The home is the site as it is.
 * What the page shows below the top, its sections say.
 */
export const sitePageView = <S extends TSite>(
  site: S,
  page: { title: string | null; intro: string | null } | null,
  label: string,
): S =>
  page
    ? {
        ...site,
        hero: {
          ...site.hero,
          tagline: null,
          title: page.title?.trim() || label,
          subtitle: page.intro,
          featuredImageUrl: null,
          featuredImageUrls: [],
        },
        sizes: { ...site.sizes, heroHeight: PAGE_TOP_HEIGHT },
      }
    : site;
