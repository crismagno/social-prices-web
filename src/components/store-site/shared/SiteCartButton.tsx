"use client";

import { CSSProperties } from "react";

import { ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";

import {
  IStoreSiteCartButton,
  siteCartButtonOf,
} from "../../../shared/business/store-sites/store-site-cart-button";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { ISiteCartApi } from "../template.types";
import useSiteT from "./useSiteT";

/** How a template writes the count beside the words. */
export type TCartCountFormat = "dot" | "paren" | "badge";

interface Props {
  settings: Partial<IStoreSiteCartButton> | null | undefined;
  cart: ISiteCartApi;
  /** The template's own look for it. */
  className?: string;
  /** The template's own words, when the owner wrote none. */
  defaultLabelKey?: string;
  countFormat?: TCartCountFormat;
}

const SCALE: Record<StoreSitesEnum.CartButtonSize, string | undefined> = {
  [StoreSitesEnum.CartButtonSize.SMALL]: "0.86",
  [StoreSitesEnum.CartButtonSize.MEDIUM]: undefined,
  [StoreSitesEnum.CartButtonSize.LARGE]: "1.16",
};

/**
 * The cart button of the site, in the template's look and as the owner set
 * it: an icon, their own words or only the icon, a size. Nothing at all for a
 * site that sells nothing.
 */
const SiteCartButton = ({
  settings,
  cart,
  className,
  defaultLabelKey = "storeSite.public.cart",
  countFormat = "dot",
}: Props) => {
  const t = useSiteT();

  const button: IStoreSiteCartButton = siteCartButtonOf(settings);

  if (!button.isVisible) {
    return null;
  }

  const label: string = button.label ?? t(defaultLabelKey);

  const count =
    countFormat === "badge" ? (
      <b>{cart.count}</b>
    ) : countFormat === "paren" ? (
      ` (${cart.count})`
    ) : (
      ` · ${cart.count}`
    );

  const style: CSSProperties | undefined = SCALE[button.size]
    ? ({ scale: SCALE[button.size] } as CSSProperties)
    : undefined;

  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={`${label} (${cart.count})`}
      onClick={cart.open}
    >
      {button.icon === StoreSitesEnum.CartButtonIcon.BAG && <ShoppingOutlined />}
      {button.icon === StoreSitesEnum.CartButtonIcon.CART && (
        <ShoppingCartOutlined />
      )}
      {button.icon !== StoreSitesEnum.CartButtonIcon.NONE &&
        button.isLabelVisible &&
        " "}
      {button.isLabelVisible ? label : null}
      {count}
    </button>
  );
};

export default SiteCartButton;
