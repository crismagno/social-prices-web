import { CSSProperties, ReactNode } from "react";

import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";

interface Props {
  theme: IStoreSiteTheme;
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
const SiteThemeVars = ({ theme, className, children }: Props) => {
  const primary: string = safe(theme?.primary, "#6b7a5e");

  const style = {
    "--site-primary": primary,
    "--site-on-primary": readableOver(primary),
    "--site-secondary": safe(theme?.secondary, "#c98b72"),
    "--site-accent": safe(theme?.accent, "#dfe8d8"),
    "--site-bg": safe(theme?.background, "#ffffff"),
    "--site-text": safe(theme?.text, "#222222"),
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

export default SiteThemeVars;
