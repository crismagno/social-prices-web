"use client";

import { ShoppingOutlined } from "@ant-design/icons";

import { ISiteCartApi } from "../template.types";
import styles from "./SitePageTop.module.css";
import useSiteT from "./useSiteT";

interface Props {
  homeUrl: string;
  brandName: string;
  /** The way back: to the products, or the home. */
  backUrl?: string;
  backLabel: string;
  /** The cart, when the site sells: its button stays at hand. */
  cart?: ISiteCartApi | null;
}

/**
 * The top of a page of the site that is not drawn by its template (a
 * product, the cart): the way back, the name of the site and the cart.
 */
const SitePageTop = ({
  homeUrl,
  brandName,
  backUrl,
  backLabel,
  cart,
}: Props) => {
  const t = useSiteT();

  return (
    <header className={styles.top}>
      <a className={styles.back} href={backUrl ?? homeUrl}>
        ← {backLabel}
      </a>
      <a className={styles.brand} href={homeUrl}>
        {brandName}
      </a>
      {cart ? (
        <button
          type="button"
          className={styles.cart}
          aria-label={`${t("storeSite.public.cart")} (${cart.count})`}
          onClick={cart.open}
        >
          <ShoppingOutlined />
          <span>{cart.count}</span>
        </button>
      ) : (
        <span />
      )}
    </header>
  );
};

export default SitePageTop;
