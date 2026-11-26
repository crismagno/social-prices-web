import StoreSitesEnum from "./store-sites.enum";

/** The cart button at the top of the site. */
export interface IStoreSiteCartButton {
  /** Off for a site that sells nothing: no cart and no "add" buttons. */
  isVisible: boolean;
  icon: StoreSitesEnum.CartButtonIcon;
  /** The words on it; empty, the template's own. */
  label: string | null;
  /** Off, only the icon shows. */
  isLabelVisible: boolean;
  size: StoreSitesEnum.CartButtonSize;
}

export const CART_BUTTON_LABEL_MAX: number = 20;

/**
 * The cart button of a site, also for one saved before the option: as the
 * template draws it. A button with no icon always keeps its words.
 */
export const siteCartButtonOf = (
  button: Partial<IStoreSiteCartButton> | null | undefined,
): IStoreSiteCartButton => {
  const icon: StoreSitesEnum.CartButtonIcon = Object.values(
    StoreSitesEnum.CartButtonIcon,
  ).includes(button?.icon as StoreSitesEnum.CartButtonIcon)
    ? (button?.icon as StoreSitesEnum.CartButtonIcon)
    : StoreSitesEnum.CartButtonIcon.NONE;

  return {
    isVisible: button?.isVisible !== false,
    icon,
    label: button?.label?.trim().slice(0, CART_BUTTON_LABEL_MAX) || null,
    isLabelVisible:
      button?.isLabelVisible !== false ||
      icon === StoreSitesEnum.CartButtonIcon.NONE,
    size: Object.values(StoreSitesEnum.CartButtonSize).includes(
      button?.size as StoreSitesEnum.CartButtonSize,
    )
      ? (button?.size as StoreSitesEnum.CartButtonSize)
      : StoreSitesEnum.CartButtonSize.MEDIUM,
  };
};
