import StoreSitesEnum from "./store-sites.enum";

/**
 * What the bag asks before an order is sent, besides the name: each field
 * asked and needed, asked but free to skip, or not asked.
 * Mirrors the API (store-site-checkout.ts): change both together.
 */
export interface IStoreSiteCheckout {
  fields: Record<StoreSitesEnum.CheckoutField, StoreSitesEnum.ChatFieldMode>;
}

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
});
