import {
  IStoreSiteHeroOptions,
  IStoreSitePageHero,
  heroOptionsOf,
  pageHeroOf,
} from "../../../shared/business/store-sites/store-site-hero";
import {
  IStoreSiteHero,
  IStoreSiteTheme,
} from "../../../shared/business/store-sites/store-site.interface";
import { IStoreSiteTemplateProps } from "../template.types";

/** How tall the top of a page other than the home is. */
export const PAGE_TOP_HEIGHT = 440;

type TSite = IStoreSiteTemplateProps["site"];

interface IPageTop {
  title: string | null;
  intro: string | null;
  hero?: IStoreSitePageHero | null;
  theme?: Partial<IStoreSiteTheme> | null;
}

/**
 * The entrance of a page that never got its own: the home's, shorter, without
 * what only the home says. Its button and colours stay the home's.
 */
const followingHero = (hero: IStoreSiteHero): Partial<IStoreSiteHero> => ({
  tagline: null,
  featuredImageUrl: null,
  featuredImageUrls: [],
  options: {
    ...heroOptionsOf(hero.options),
    // The title of a page is the page's own: hiding the home's does not hide it.
    isTitleVisible: true,
    isSubtitleVisible: true,
    extraText: null,
    secondButton: null,
  },
});

/**
 * The entrance of a page that has its own: its line, button, pictures and
 * colours. What it leaves empty (the picture behind, the words of the button,
 * a colour) is the home's.
 */
const ownHero = (
  hero: IStoreSiteHero,
  own: IStoreSitePageHero,
): Partial<IStoreSiteHero> => {
  const home: IStoreSiteHeroOptions = heroOptionsOf(hero.options);

  return {
    tagline: own.tagline,
    ctaLabel: own.ctaLabel?.trim() || hero.ctaLabel,
    // Its own pictures take turns as it says; with none, the home's do.
    ...(own.backgroundImageUrl
      ? {
          backgroundImageUrl: own.backgroundImageUrl,
          backgroundImageUrls: own.backgroundImageUrls,
          slideSeconds: own.slideSeconds ?? hero.slideSeconds,
        }
      : {}),
    featuredImageUrl: own.featuredImageUrl,
    featuredImageUrls: own.featuredImageUrl ? own.featuredImageUrls : [],
    featuredSlideSeconds: own.featuredSlideSeconds ?? hero.featuredSlideSeconds,
    options: {
      ...own.options,
      // A line or picture the page does not want is simply left empty.
      isTaglineVisible: true,
      isTitleVisible: true,
      isSubtitleVisible: true,
      isFeaturedVisible: true,
      colors: {
        background: own.options.colors.background ?? home.colors.background,
        text: own.options.colors.text ?? home.colors.text,
        button: own.options.colors.button ?? home.colors.button,
      },
    },
  };
};

/**
 * The site as one of its pages shows it: the top says the page's own title,
 * and is the page's own entrance when it has one. The home is the site as it
 * is. What the page shows below the top, its sections say.
 */
export const sitePageView = <S extends TSite>(
  site: S,
  page: IPageTop | null,
  label: string,
): S => {
  if (!page) {
    return site;
  }

  const own: IStoreSitePageHero | null = pageHeroOf(page.hero);

  return {
    ...site,
    // Its own colours over the site's; one it leaves out is the site's.
    theme: { ...site.theme, ...(page.theme ?? {}) },
    hero: {
      ...site.hero,
      ...(own ? ownHero(site.hero, own) : followingHero(site.hero)),
      title: page.title?.trim() || label,
      subtitle: page.intro,
    },
    // Its own height, else the one the owner gave the entrance, else a top
    // shorter than the home's.
    sizes: {
      ...site.sizes,
      // The sizes its entrance has of its own; the others are the site's.
      ...(own?.sizes ?? {}),
      heroHeight: own?.height ?? site.sizes?.heroHeight ?? PAGE_TOP_HEIGHT,
    },
  };
};

/**
 * The site as it is drawn over a backdrop: its entrance has no picture of its
 * own, so the backdrop shows behind it too. A page that was given a picture
 * for its entrance keeps it.
 */
export const withBackdropEntrance = <S extends { hero: IStoreSiteHero }>(
  site: S,
  page:
    { hero?: { backgroundImageUrl?: string | null } | null } | null | undefined,
): S =>
  page?.hero?.backgroundImageUrl
    ? site
    : {
        ...site,
        hero: {
          ...site.hero,
          backgroundImageUrl: null,
          backgroundImageUrls: [],
        },
      };
