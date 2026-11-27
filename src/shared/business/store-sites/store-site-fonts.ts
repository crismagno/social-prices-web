import StoreSitesEnum from "./store-sites.enum";

/** The typefaces of the site; an empty one is the template's own. */
export interface IStoreSiteFonts {
  /** Titles and whatever the template writes in its display face. */
  heading: StoreSitesEnum.Font | null;
  /** Everything else. */
  body: StoreSitesEnum.Font | null;
}

export type TSiteFontPlace = keyof IStoreSiteFonts;

export const SITE_FONT_PLACES: TSiteFontPlace[] = ["heading", "body"];

/** The typefaces by their own names, which no language changes. */
export const SITE_FONT_NAMES: Record<StoreSitesEnum.Font, string> = {
  [StoreSitesEnum.Font.INTER]: "Inter",
  [StoreSitesEnum.Font.ROBOTO]: "Roboto",
  [StoreSitesEnum.Font.POPPINS]: "Poppins",
  [StoreSitesEnum.Font.MONTSERRAT]: "Montserrat",
  [StoreSitesEnum.Font.OPEN_SANS]: "Open Sans",
  [StoreSitesEnum.Font.LATO]: "Lato",
  [StoreSitesEnum.Font.NUNITO]: "Nunito",
  [StoreSitesEnum.Font.RALEWAY]: "Raleway",
  [StoreSitesEnum.Font.DM_SANS]: "DM Sans",
  [StoreSitesEnum.Font.SPACE_GROTESK]: "Space Grotesk",
  [StoreSitesEnum.Font.QUICKSAND]: "Quicksand",
  [StoreSitesEnum.Font.PLAYFAIR_DISPLAY]: "Playfair Display",
  [StoreSitesEnum.Font.LORA]: "Lora",
  [StoreSitesEnum.Font.MERRIWEATHER]: "Merriweather",
  [StoreSitesEnum.Font.CORMORANT_GARAMOND]: "Cormorant Garamond",
  [StoreSitesEnum.Font.OSWALD]: "Oswald",
  [StoreSitesEnum.Font.BEBAS_NEUE]: "Bebas Neue",
};

const FONTS: string[] = Object.values(StoreSitesEnum.Font);

const fontOf = (value: unknown): StoreSitesEnum.Font | null =>
  typeof value === "string" && FONTS.includes(value)
    ? (value as StoreSitesEnum.Font)
    : null;

/**
 * The typefaces of a site, whatever was stored: the template's own unless the
 * owner chose one of those on offer. The API checks them the same way.
 */
export const siteFontsOf = (
  fonts: Partial<IStoreSiteFonts> | null | undefined,
): IStoreSiteFonts => ({
  heading: fontOf(fonts?.heading),
  body: fontOf(fonts?.body),
});
