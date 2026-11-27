import StoreSitesEnum from "./store-sites.enum";

/**
 * What the bag asks before an order is sent, besides the name: each field
 * asked and needed, asked but free to skip, or not asked.
 * Mirrors the API (store-site-checkout.ts): change both together.
 */
export interface IStoreSiteCheckout {
  fields: Record<StoreSitesEnum.CheckoutField, StoreSitesEnum.ChatFieldMode>;
  look: IStoreSiteCartLook;
}

/** How the cart window looks and what it shows of each product. */
export interface IStoreSiteCartLook {
  /** Its own title; null keeps the default one. */
  title: string | null;
  mode: StoreSitesEnum.CartMode;
  width: StoreSitesEnum.CartWidth;
  side: StoreSitesEnum.CartSide;
  isPhotoShown: boolean;
  isBrandShown: boolean;
  isDescriptionShown: boolean;
  /** Size and colors of the product. */
  isTagsShown: boolean;
  /** A click on a product shows it in full. */
  isProductOpened: boolean;
  isShippingNoteShown: boolean;
  /** Its own words about shipping; null keeps the default ones. */
  shippingNote: string | null;
  /** Its own words on the button to go on; null keeps the default ones. */
  buttonLabel: string | null;
}

export const CART_TITLE_MAX = 40;

/** The page of the site the cart opens on, when it has one of its own. */
export const CART_PAGE_SLUG = "carrinho";
export const CART_SHIPPING_NOTE_MAX = 200;
export const CART_BUTTON_LABEL_MAX = 30;

/** The width of the cart window for each choice. */
export const CART_WIDTH_PX: Record<StoreSitesEnum.CartWidth, number> = {
  [StoreSitesEnum.CartWidth.NARROW]: 420,
  [StoreSitesEnum.CartWidth.NORMAL]: 560,
  [StoreSitesEnum.CartWidth.WIDE]: 720,
};

const textOf = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

const oneOf = <T extends string>(
  values: T[],
  value: unknown,
  fallback: T,
): T => (values.includes(value as T) ? (value as T) : fallback);

/** The cart window as the owner set it; whatever is missing shows as before. */
export const cartLookOf = (
  look: Partial<IStoreSiteCartLook> | null | undefined,
): IStoreSiteCartLook => ({
  title: textOf(look?.title, CART_TITLE_MAX),
  mode: oneOf(
    Object.values(StoreSitesEnum.CartMode),
    look?.mode,
    StoreSitesEnum.CartMode.DRAWER,
  ),
  width: oneOf(
    Object.values(StoreSitesEnum.CartWidth),
    look?.width,
    StoreSitesEnum.CartWidth.NORMAL,
  ),
  side: oneOf(
    Object.values(StoreSitesEnum.CartSide),
    look?.side,
    StoreSitesEnum.CartSide.RIGHT,
  ),
  isPhotoShown: look?.isPhotoShown !== false,
  isBrandShown: look?.isBrandShown !== false,
  isDescriptionShown: look?.isDescriptionShown !== false,
  isTagsShown: look?.isTagsShown !== false,
  isProductOpened: look?.isProductOpened !== false,
  isShippingNoteShown: look?.isShippingNoteShown !== false,
  shippingNote: textOf(look?.shippingNote, CART_SHIPPING_NOTE_MAX),
  buttonLabel: textOf(look?.buttonLabel, CART_BUTTON_LABEL_MAX),
});

const Field = StoreSitesEnum.CheckoutField;
const Mode = StoreSitesEnum.ChatFieldMode;

/** As every site asked before the owner could choose: all of it but the note. */
const DEFAULT_MODES: IStoreSiteCheckout["fields"] = {
  [Field.EMAIL]: Mode.REQUIRED,
  [Field.PHONE]: Mode.REQUIRED,
  [Field.ADDRESS]: Mode.REQUIRED,
  [Field.NOTE]: Mode.OPTIONAL,
};

/** The fields of the bag, also for a site saved before the option. */
export const siteCheckoutOf = (
  checkout: Partial<IStoreSiteCheckout> | null | undefined,
): IStoreSiteCheckout => ({
  fields: Object.values(Field).reduce(
    (fields, field: StoreSitesEnum.CheckoutField) => {
      const mode: unknown = checkout?.fields?.[field];

      fields[field] = Object.values(Mode).includes(
        mode as StoreSitesEnum.ChatFieldMode,
      )
        ? (mode as StoreSitesEnum.ChatFieldMode)
        : DEFAULT_MODES[field];

      return fields;
    },
    {} as IStoreSiteCheckout["fields"],
  ),
  look: cartLookOf(checkout?.look),
});
