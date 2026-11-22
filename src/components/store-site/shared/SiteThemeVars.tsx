import { CSSProperties, ReactNode } from "react";

import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import {
  siteSizesOf,
  TSiteSizeKey,
  TStoreSiteSizes,
} from "../../../shared/business/store-sites/store-site-sizes";

interface Props {
  theme: IStoreSiteTheme;
  /** Sizes the owner set; a template falls back to its own for the rest. */
  sizes?: Partial<TStoreSiteSizes> | null;
  className?: string;
  children: ReactNode;
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// A color that is not a plain hex never reaches the page's CSS.
const safe = (color: string | undefined, fallback: string): string =>
  color && HEX_COLOR.test(color) ? color : fallback;

// Dark text over a light color, light text over a dark one (WCAG luminance).
const readableOver = (hex: string): string => {
  const [red, green, blue]: number[] = [1, 3, 5].map((start: number) => {
    const channel: number = parseInt(hex.slice(start, start + 2), 16) / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  const luminance: number = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  return luminance > 0.45 ? "#161616" : "#ffffff";
};

/**
 * Hands the five colors of the site to its CSS as variables, plus the text
 * color that stays readable over the main one, whatever the owner picked.
 */
/**
 * One CSS variable per size that was set, and none for the others: the
 * templates write `var(--sz-…, their own value)`, so an empty size changes
 * nothing. A picture with a height set stops keeping its proportion.
 */
const sizeVars = (
  sizes: Partial<TStoreSiteSizes> | null | undefined,
): Record<string, string> => {
  const checked: TStoreSiteSizes = siteSizesOf(sizes);

  const vars: Record<string, string> = {};

  const set = (name: string, key: TSiteSizeKey, ratioName?: string): void => {
    const pixels: number | null = checked[key];

    if (pixels === null) {
      return;
    }

    vars[name] = `${pixels}px`;

    if (ratioName) {
      vars[ratioName] = "auto";
    }
  };

  set("--sz-logo-w", "logoWidth");
  set("--sz-logo-h", "logoHeight");
  set("--sz-brand-w", "brandNameWidth");
  set("--sz-brand-h", "brandNameHeight");
  set("--sz-brand", "brandNameSize");
  set("--sz-hero-h", "heroHeight");
  set("--sz-title-w", "heroTitleWidth");
  set("--sz-title", "heroTitleSize");
  set("--sz-subtitle-w", "heroSubtitleWidth");
  set("--sz-subtitle", "heroSubtitleSize");
  set("--sz-featured-w", "featuredImageWidth");
  set("--sz-featured-h", "featuredImageHeight", "--sz-featured-ratio");
  set("--sz-section-img-w", "sectionImageWidth");
  set("--sz-section-img-h", "sectionImageHeight", "--sz-section-img-ratio");
  set("--sz-section-title", "sectionTitleSize");
  set("--sz-section-text", "sectionTextSize");
  set("--sz-product-w", "productWidth");
  set("--sz-product-img-h", "productImageHeight", "--sz-product-img-ratio");
  set("--sz-product-name", "productNameSize");

  return vars;
};

const SiteThemeVars = ({ theme, sizes, className, children }: Props) => {
  const primary: string = safe(theme?.primary, "#6b7a5e");

  const style = {
    "--site-primary": primary,
    "--site-on-primary": readableOver(primary),
    "--site-secondary": safe(theme?.secondary, "#c98b72"),
    "--site-accent": safe(theme?.accent, "#dfe8d8"),
    "--site-bg": safe(theme?.background, "#ffffff"),
    "--site-text": safe(theme?.text, "#222222"),
    ...sizeVars(sizes),
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

export default SiteThemeVars;
