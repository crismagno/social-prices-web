import {
  Barlow_Condensed,
  Bebas_Neue,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  Lato,
  Lora,
  Merriweather,
  Montserrat,
  Nunito,
  Open_Sans,
  Oswald,
  Playfair_Display,
  Poppins,
  Press_Start_2P,
  Quicksand,
  Raleway,
  Roboto,
  Space_Grotesk,
} from "next/font/google";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

// Loaded once and shared: a template only picks which one it speaks in.
export const siteSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--site-serif",
});

export const siteRounded = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  display: "swap",
});

export const siteCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--site-condensed",
});

// Only for titles and labels: it is too wide to read in a paragraph.
export const sitePixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--site-pixel",
});

// Soft, high-contrast serif with a true italic: the Maré template's voice.
export const siteFraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--site-fraunces",
});

/**
 * Marks what a template writes in its display face, wherever it does so by a
 * class of its own: a typeface the owner chose for the titles replaces it.
 */
export const SITE_DISPLAY_CLASS: string = "site-display";

export const siteSerifClass: string = `${siteSerif.className} ${SITE_DISPLAY_CLASS}`;

export const siteCondensedClass: string = `${siteCondensed.className} ${SITE_DISPLAY_CLASS}`;

/*
 * The typefaces an owner may choose in place of the template's. None is
 * fetched ahead: a visitor only downloads the ones the site really uses.
 */
const ownerInter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerRoboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const ownerMontserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerOpenSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerLato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const ownerNunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerRaleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerDmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerQuicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerPlayfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerLora = Lora({ subsets: ["latin"], display: "swap", preload: false });

const ownerMerriweather = Merriweather({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerOswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ownerBebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

/** What goes in `font-family` for each typeface on offer. */
export const SITE_FONT_FAMILY: Record<StoreSitesEnum.Font, string> = {
  [StoreSitesEnum.Font.INTER]: ownerInter.style.fontFamily,
  [StoreSitesEnum.Font.ROBOTO]: ownerRoboto.style.fontFamily,
  [StoreSitesEnum.Font.POPPINS]: ownerPoppins.style.fontFamily,
  [StoreSitesEnum.Font.MONTSERRAT]: ownerMontserrat.style.fontFamily,
  [StoreSitesEnum.Font.OPEN_SANS]: ownerOpenSans.style.fontFamily,
  [StoreSitesEnum.Font.LATO]: ownerLato.style.fontFamily,
  [StoreSitesEnum.Font.NUNITO]: ownerNunito.style.fontFamily,
  [StoreSitesEnum.Font.RALEWAY]: ownerRaleway.style.fontFamily,
  [StoreSitesEnum.Font.DM_SANS]: ownerDmSans.style.fontFamily,
  [StoreSitesEnum.Font.SPACE_GROTESK]: ownerSpaceGrotesk.style.fontFamily,
  [StoreSitesEnum.Font.QUICKSAND]: ownerQuicksand.style.fontFamily,
  [StoreSitesEnum.Font.PLAYFAIR_DISPLAY]: ownerPlayfair.style.fontFamily,
  [StoreSitesEnum.Font.LORA]: ownerLora.style.fontFamily,
  [StoreSitesEnum.Font.MERRIWEATHER]: ownerMerriweather.style.fontFamily,
  [StoreSitesEnum.Font.CORMORANT_GARAMOND]: ownerCormorant.style.fontFamily,
  [StoreSitesEnum.Font.OSWALD]: ownerOswald.style.fontFamily,
  [StoreSitesEnum.Font.BEBAS_NEUE]: ownerBebas.style.fontFamily,
};
