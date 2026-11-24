import {
  Barlow_Condensed,
  Fraunces,
  Nunito,
  Playfair_Display,
  Press_Start_2P,
} from "next/font/google";

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
