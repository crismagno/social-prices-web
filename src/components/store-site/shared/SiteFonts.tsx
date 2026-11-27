"use client";

import {
  createContext,
  CSSProperties,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import {
  IStoreSiteFonts,
  siteFontsOf,
} from "../../../shared/business/store-sites/store-site-fonts";
import base from "./site-base.module.css";
import { SITE_FONT_FAMILY } from "./site-fonts";

interface ISiteFontProps {
  className: string;
  style: CSSProperties;
}

const NONE: ISiteFontProps = { className: "", style: {} };

const SiteFontsContext = createContext<ISiteFontProps>(NONE);

// The variables the templates read their display faces from.
const DISPLAY_VARS: string[] = [
  "--site-serif",
  "--site-condensed",
  "--site-fraunces",
  "--site-pixel",
];

/**
 * What changes the typefaces the owner replaced: the one of the texts goes
 * straight on the root of the site, the one of the titles into the variables
 * the templates read and a class for the titles they draw by other means. A
 * place left to the template gets nothing.
 */
export const siteFontProps = (
  fonts: Partial<IStoreSiteFonts> | null | undefined,
): ISiteFontProps => {
  const { heading, body } = siteFontsOf(fonts);

  if (!heading && !body) {
    return NONE;
  }

  const style: Record<string, string> = {};

  if (body) {
    style.fontFamily = SITE_FONT_FAMILY[body];
  }

  if (heading) {
    const family: string = SITE_FONT_FAMILY[heading];

    style["--site-font-heading"] = family;

    DISPLAY_VARS.forEach((name: string) => {
      style[name] = family;
    });
  }

  return {
    className: heading ? base.fontHeading : "",
    style: style as CSSProperties,
  };
};

interface Props {
  fonts: Partial<IStoreSiteFonts> | null | undefined;
  children: ReactNode;
}

/**
 * Hands the owner's typefaces to every root of the site under it: the page,
 * and whatever opens over it (a product, the bag), wherever it is drawn.
 */
const SiteFonts = ({ fonts, children }: Props) => {
  const heading = fonts?.heading ?? null;
  const body = fonts?.body ?? null;

  const value: ISiteFontProps = useMemo(
    () => siteFontProps({ heading, body }),
    [heading, body],
  );

  return (
    <SiteFontsContext.Provider value={value}>
      {children}
    </SiteFontsContext.Provider>
  );
};

/** The class and the style a root of the site takes for the typefaces. */
export const useSiteFontProps = (): ISiteFontProps =>
  useContext(SiteFontsContext);

export default SiteFonts;
