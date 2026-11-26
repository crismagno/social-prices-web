import { IStoreSiteBlockButton, blockButtonOf } from "./store-site-blocks";

/** Colours of the entrance alone; an empty one is the template's own. */
export interface IStoreSiteHeroColors {
  background: string | null;
  text: string | null;
  button: string | null;
}

/**
 * The owner's own choices for the entrance: which of its pieces show, one more
 * paragraph, where its button leads, a second button and its own colours.
 * Mirrors the API (store-site-hero.ts): change both together.
 */
export interface IStoreSiteHeroOptions {
  isTaglineVisible: boolean;
  isSubtitleVisible: boolean;
  isFeaturedVisible: boolean;
  isButtonVisible: boolean;
  /** A paragraph under the subtitle. */
  extraText: string | null;
  /** Where the main button leads; none, to the products. Its words are `ctaLabel`. */
  button: IStoreSiteBlockButton | null;
  /** One more button beside the main one; none without words. */
  secondButton: IStoreSiteBlockButton | null;
  colors: IStoreSiteHeroColors;
}

export const HERO_EXTRA_TEXT_MAX: number = 400;

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const colorOf = (value: unknown): string | null =>
  typeof value === "string" && HEX_COLOR_REGEX.test(value.trim())
    ? value.trim().toLowerCase()
    : null;

const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const heroButtonOf = (button: unknown): IStoreSiteBlockButton | null =>
  button && typeof button === "object" && !Array.isArray(button)
    ? blockButtonOf(button)
    : null;

/**
 * The owner's choices for the entrance, also for a site saved before them:
 * every piece shown, the button to the products, no second button and the
 * template's colours. A second button being written is kept, even with no
 * words yet: the site shows it once it has some.
 */
export const heroOptionsOf = (options: unknown): IStoreSiteHeroOptions => {
  const source: Record<string, unknown> = recordOf(options);
  const colors: Record<string, unknown> = recordOf(source.colors);

  return {
    isTaglineVisible: source.isTaglineVisible !== false,
    isSubtitleVisible: source.isSubtitleVisible !== false,
    isFeaturedVisible: source.isFeaturedVisible !== false,
    isButtonVisible: source.isButtonVisible !== false,
    extraText:
      typeof source.extraText === "string" && source.extraText.trim()
        ? source.extraText.slice(0, HERO_EXTRA_TEXT_MAX)
        : null,
    button: heroButtonOf(source.button),
    secondButton: heroButtonOf(source.secondButton),
    colors: {
      background: colorOf(colors.background),
      text: colorOf(colors.text),
      button: colorOf(colors.button),
    },
  };
};
