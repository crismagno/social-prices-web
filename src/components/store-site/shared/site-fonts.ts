import { Nunito, Playfair_Display } from "next/font/google";

// Loaded once and shared: a template only picks which one it speaks in.
export const siteSerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const siteRounded = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  display: "swap",
});
