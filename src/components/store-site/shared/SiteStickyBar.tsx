"use client";

import { useEffect, useState } from "react";

import { siteHeaderOf } from "../../../shared/business/store-sites/store-site-header";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import { IPublicSiteStore } from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi, IStoreSiteTemplateProps } from "../template.types";
import SiteCartButton from "./SiteCartButton";
import SiteMenu from "./SiteMenu";
import SiteSignIn from "./SiteSignIn";
import styles from "./SiteStickyBar.module.css";
import SiteThemeVars from "./SiteThemeVars";
import { siteHasAbout } from "./SiteAbout";
import { getSiteContent } from "./useSiteContent";
import { sitePagePath } from "../../../shared/business/store-sites/store-site-pages";

interface Props {
  site: IStoreSiteTemplateProps["site"];
  store: IPublicSiteStore;
  cart: ISiteCartApi;
  page: IStoreSitePage | null;
}

interface IBarNavProps extends Props {
  /** Out of sight: nothing in it is read or reached. */
  isHidden?: boolean;
}

/** The name, the menu, the sign-in and the cart, as both bars show them. */
const SiteBarNav = ({ site, store, cart, page, isHidden }: IBarNavProps) => {
  const { logo, brandName } = getSiteContent({ site, store });

  return (
    <nav className={styles.inner} aria-hidden={isHidden || undefined}>
      <a href={sitePagePath(site.slug)} className={styles.brand}>
        {logo && <img src={logo} alt="" />}
        <span>{brandName}</span>
      </a>
      <span className={styles.links}>
        <SiteMenu
          pages={site.pages}
          siteSlug={site.slug}
          currentKey={page?.key}
          hasAbout={siteHasAbout(site.about, store.about)}
        />
      </span>
      <span className={styles.end}>
        {site.signIn?.isVisible !== false && (
          <SiteSignIn
            signIn={site.signIn}
            storeId={site.storeId}
            className={styles.signIn}
            isCompact
          />
        )}
        <SiteCartButton
          settings={site.cartButton}
          cart={cart}
          className={styles.cart}
          defaultLabelKey="storeSite.public.cart"
          countFormat="badge"
        />
      </span>
    </nav>
  );
};

/**
 * The menu that stays on screen, for a site whose owner wants the top fixed:
 * once the visitor scrolls past the top it slides down with the name, the
 * menu, the sign-in and the cart, in the site's colours. It works the same
 * over every template, whose own top stays as it is.
 */
const SiteStickyBar = ({ site, store, cart, page }: Props) => {
  const [isShown, setIsShown] = useState<boolean>(false);

  const isFixed: boolean = siteHeaderOf(site.header).isFixed;

  useEffect(() => {
    if (!isFixed) {
      setIsShown(false);
      return;
    }

    // Past most of the first screen: the template's own top is out of sight.
    const check = (): void =>
      setIsShown(window.scrollY > window.innerHeight * 0.55);

    check();
    window.addEventListener("scroll", check, { passive: true });

    return () => window.removeEventListener("scroll", check);
  }, [isFixed]);

  // Whatever sticks to the top of the page (a menu of tabs) stops under this
  // bar while it shows.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--site-sticky-top",
      isShown ? "60px" : "0px",
    );

    return () => {
      document.documentElement.style.removeProperty("--site-sticky-top");
    };
  }, [isShown]);

  if (!isFixed) {
    return null;
  }

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${styles.bar} ${isShown ? styles.shown : ""}`}
    >
      <SiteBarNav
        site={site}
        store={store}
        cart={cart}
        page={page}
        isHidden={!isShown}
      />
    </SiteThemeVars>
  );
};

/**
 * The menu as a bar of its own at the top of a page that does not start with
 * the entrance (moved down, or hidden): the same bar as the fixed menu, always
 * there. A page that starts with the entrance has its menu inside it, in the
 * template's own look.
 */
export const SiteTopBar = ({ site, store, cart, page }: Props) => (
  <SiteThemeVars
    theme={site.theme}
    sizes={site.sizes}
    className={styles.topBar}
  >
    <SiteBarNav site={site} store={store} cart={cart} page={page} />
  </SiteThemeVars>
);

export default SiteStickyBar;
