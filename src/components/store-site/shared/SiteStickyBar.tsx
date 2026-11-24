"use client";

import { useEffect, useState } from "react";

import { siteHeaderOf } from "../../../shared/business/store-sites/store-site-header";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import { IPublicSiteStore } from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi, IStoreSiteTemplateProps } from "../template.types";
import SiteMenu from "./SiteMenu";
import SiteSignIn from "./SiteSignIn";
import styles from "./SiteStickyBar.module.css";
import SiteThemeVars from "./SiteThemeVars";
import { siteHasAbout } from "./SiteAbout";
import { getSiteContent } from "./useSiteContent";
import useSiteT from "./useSiteT";
import { sitePagePath } from "../../../shared/business/store-sites/store-site-pages";

interface Props {
  site: IStoreSiteTemplateProps["site"];
  store: IPublicSiteStore;
  cart: ISiteCartApi;
  page: IStoreSitePage | null;
}

/**
 * The menu that stays on screen, for a site whose owner wants the top fixed:
 * once the visitor scrolls past the top it slides down with the name, the
 * menu, the sign-in and the cart, in the site's colours. It works the same
 * over every template, whose own top stays as it is.
 */
const SiteStickyBar = ({ site, store, cart, page }: Props) => {
  const t = useSiteT();
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

  if (!isFixed) {
    return null;
  }

  const { logo, brandName } = getSiteContent({ site, store });

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${styles.bar} ${isShown ? styles.shown : ""}`}
    >
      <nav className={styles.inner} aria-hidden={!isShown}>
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
          <button type="button" className={styles.cart} onClick={cart.open}>
            {t("storeSite.public.cart")} <b>{cart.count}</b>
          </button>
        </span>
      </nav>
    </SiteThemeVars>
  );
};

export default SiteStickyBar;
