"use client";

import { IStoreSiteHero } from "../../../shared/business/store-sites/store-site.interface";
import ImageSlides, { slideKeysOf } from "./ImageSlides";

interface Props {
  hero: IStoreSiteHero;
  /** The template's own class for its background: size, position, movement. */
  className: string;
}

/** The backgrounds of the entrance, in the order they are shown. */
export const heroSlideKeys = (
  hero: Pick<IStoreSiteHero, "backgroundImageUrl" | "backgroundImageUrls">,
): string[] => slideKeysOf(hero.backgroundImageUrl, hero.backgroundImageUrls);

/** The featured images of the entrance, in the order they are shown. */
export const featuredSlideKeys = (
  hero: Pick<IStoreSiteHero, "featuredImageUrl" | "featuredImageUrls">,
): string[] => slideKeysOf(hero.featuredImageUrl, hero.featuredImageUrls);

/**
 * The background of the entrance. With one image it is that image, as always;
 * with more, they take turns. Every template draws it with its own class, so
 * the slider looks like part of each one.
 */
const HeroBackground = ({ hero, className }: Props) => (
  <ImageSlides
    keys={heroSlideKeys(hero)}
    seconds={hero.slideSeconds}
    className={className}
  />
);

export default HeroBackground;
