import { IStoreSiteLogo } from "../../../shared/business/store-sites/store-site.interface";
import { getImageUrl } from "../../../shared/utils/images/images-url";

const MONEY: Intl.NumberFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const formatSiteMoney = (value: number): string =>
  MONEY.format(Number.isFinite(value) ? value : 0);

/** The address of an image of the site, or null when there is none. */
export const siteImage = (fileKey: string | null | undefined): string | null =>
  fileKey?.trim() ? getImageUrl(fileKey) : null;

/**
 * The logo the site shows: its own image, else the logo of the store, and
 * none when it is switched off.
 */
export const siteLogo = (
  logo: IStoreSiteLogo | null | undefined,
  storeLogo: string | null | undefined,
): string | null => {
  if (logo && !logo.isActive) {
    return null;
  }

  return siteImage(logo?.imageUrl) ?? siteImage(storeLogo);
};

export const cssUrl = (
  fileKey: string | null | undefined,
): string | undefined => {
  const url: string | null = siteImage(fileKey);

  return url ? `url("${url.replace(/"/g, "%22")}")` : undefined;
};
