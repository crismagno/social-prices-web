"use client";

import { CSSProperties, MouseEvent } from "react";

import {
  IStoreSiteBlockButton,
  blockButtonHref,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteHeroOptions,
  heroOptionsOf,
} from "../../../shared/business/store-sites/store-site-hero";
import { IStoreSiteHero } from "../../../shared/business/store-sites/store-site.interface";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import base from "./site-base.module.css";
import useSiteT from "./useSiteT";

/**
 * The entrance as the templates read it: a line or a subtitle the owner hid
 * is simply not there, so each template draws it as one that has none.
 */
export const heroViewOf = (hero: IStoreSiteHero): IStoreSiteHero => {
  const options: IStoreSiteHeroOptions = heroOptionsOf(hero.options);

  return {
    ...hero,
    tagline: options.isTaglineVisible ? hero.tagline : null,
    subtitle: options.isSubtitleVisible ? hero.subtitle : null,
  };
};

// Dark words over a light colour, light ones over a dark one (WCAG luminance).
const readableOver = (hex: string): string => {
  const [red, green, blue]: number[] = [1, 3, 5].map((start: number) => {
    const channel: number = parseInt(hex.slice(start, start + 2), 16) / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.45
    ? "#161616"
    : "#ffffff";
};

/**
 * What the top element of an entrance takes for the owner's colours to apply
 * over the template's, whichever template it is: the class that carries the
 * rules, which colours were set, and their values.
 */
export const heroColorProps = (
  hero: IStoreSiteHero,
  className: string,
): {
  className: string;
  "data-hero-colors"?: string;
  "data-hero-title"?: "off";
  style?: CSSProperties;
} => {
  const options: IStoreSiteHeroOptions = heroOptionsOf(hero.options);
  const { background, text, button } = options.colors;

  // A title the owner hid stays in the page, only out of sight.
  const title: { "data-hero-title"?: "off" } = options.isTitleVisible
    ? {}
    : { "data-hero-title": "off" };

  const set: string[] = [
    background ? "bg" : "",
    text ? "text" : "",
    button ? "btn" : "",
  ].filter(Boolean);

  if (!set.length) {
    return { className: `${className} ${base.heroPart}`, ...title };
  }

  return {
    className: `${className} ${base.heroPart}`,
    ...title,
    "data-hero-colors": set.join(" "),
    style: {
      ...(background ? { "--hero-bg": background } : {}),
      ...(text ? { "--hero-text": text } : {}),
      ...(button
        ? { "--hero-btn": button, "--hero-btn-text": readableOver(button) }
        : {}),
    } as CSSProperties,
  };
};

interface IExtraTextProps {
  hero: IStoreSiteHero;
  /** The template's own class for the subtitle: the paragraph looks like it. */
  className?: string;
}

/** The paragraph the owner added under the subtitle, when there is one. */
export const SiteHeroExtraText = ({ hero, className }: IExtraTextProps) => {
  const text: string | null =
    heroOptionsOf(hero.options).extraText?.trim() || null;

  return text ? (
    <p className={`${className ?? ""} ${base.heroExtraText}`}>{text}</p>
  ) : null;
};

interface IButtonsProps {
  hero: IStoreSiteHero;
  /** The template's own class for its main button. */
  className: string;
  /** Where the main button leads when the owner chose nowhere: the products. */
  productsHref: string;
  siteSlug: string;
  pages: IStoreSitePage[] | null | undefined;
  mode: "live" | "preview";
  /** What the template writes around the words of its button, like an arrow. */
  prefix?: string;
  suffix?: string;
  /** The template's own order of entrance, when its button has one. */
  intro?: string;
}

/**
 * The buttons of the entrance, in the template's own look: the main one,
 * unless the owner hid it, leading where they chose; and the second one,
 * when it has words and somewhere safe to go.
 */
export const SiteHeroButtons = ({
  hero,
  className,
  productsHref,
  siteSlug,
  pages,
  mode,
  prefix = "",
  suffix = "",
  intro,
}: IButtonsProps) => {
  const t = useSiteT();

  const options: IStoreSiteHeroOptions = heroOptionsOf(hero.options);

  const link = (href: string) => ({
    href,
    ...(/^https?:/.test(href) ? { target: "_blank", rel: "noreferrer" } : {}),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      // In the editor nothing navigates, like every other button of the site.
      if (mode === "preview" && !href.startsWith("#")) {
        event.preventDefault();
      }
    },
  });

  // A destination that goes nowhere safe falls back to the products.
  const mainHref: string =
    (options.button && blockButtonHref(options.button, siteSlug, pages)) ||
    productsHref;

  const second: IStoreSiteBlockButton | null = options.secondButton;

  const secondHref: string | null = second?.label?.trim()
    ? blockButtonHref(second, siteSlug, pages)
    : null;

  const hasSecond: boolean = !!second && !!secondHref;

  const buttons = (
    <>
      {options.isButtonVisible && (
        <a
          {...link(mainHref)}
          className={className}
          data-hero="cta"
          data-shine
          data-intro={intro}
        >
          {prefix}
          {hero.ctaLabel || t("storeSite.public.seeProducts")}
          {suffix}
        </a>
      )}
      {second && secondHref && (
        <a
          {...link(secondHref)}
          className={`${className} ${base.heroSecond} ${
            second.variant === StoreSitesEnum.ButtonVariant.OUTLINE
              ? base.heroSecondOutline
              : ""
          }`}
          data-hero={
            second.variant === StoreSitesEnum.ButtonVariant.OUTLINE
              ? "cta-outline"
              : "cta"
          }
          data-intro={intro}
        >
          {second.label}
        </a>
      )}
    </>
  );

  // Two buttons go side by side, close together, wherever the template puts
  // its own; one alone stays exactly as the template draws it.
  return hasSecond ? (
    <span className={base.heroButtons} data-hero-buttons>
      {buttons}
    </span>
  ) : (
    buttons
  );
};
