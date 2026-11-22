namespace StoreSitesEnum {
  export enum Template {
    AURORA = "AURORA",
    IMPACT = "IMPACT",
    ATELIER = "ATELIER",
    GARDEN = "GARDEN",
    STUDIO = "STUDIO",
  }

  /** Lowercase letters, digits and hyphens, 3 to 40 characters. */
  export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

  export const MAX_SECTIONS = 6;
  export const MAX_MARQUEE_ITEMS = 8;
  export const MAX_PRODUCTS = 60;

  export const MAX_ORDER_ITEMS = 50;
  export const MAX_ORDER_ITEM_QUANTITY = 99;

  export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

  export enum ErrorCodes {
    SLUG_TAKEN = "STORE_SITE_SLUG_TAKEN",
    INVALID_PRODUCTS = "STORE_SITE_INVALID_PRODUCTS",
    IMAGE_TOO_LARGE = "STORE_SITE_IMAGE_TOO_LARGE",
    ORDER_ITEMS_UNAVAILABLE = "SITE_ORDER_ITEMS_UNAVAILABLE",
    ORDER_TOO_MANY_ATTEMPTS = "SITE_ORDER_TOO_MANY_ATTEMPTS",
    ORDER_FAILED = "SITE_ORDER_FAILED",
  }
}

export default StoreSitesEnum;
