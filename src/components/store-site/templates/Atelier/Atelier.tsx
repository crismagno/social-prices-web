"use client";

import { CSSProperties } from "react";

import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import ImageSlides from "../../shared/ImageSlides";
import HeroBackground, {
  featuredSlideKeys,
  heroSlideKeys,
} from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import { siteSerif } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout, { siteHasAbout } from "../../shared/SiteAbout";
import SiteFooter from "../../shared/SiteFooter";
import SiteMenu from "../../shared/SiteMenu";
import SitePageBody from "../../shared/SitePageBody";
import SiteSignIn from "../../shared/SiteSignIn";
import SiteThemeVars from "../../shared/SiteThemeVars";
import { getSiteContent } from "../../shared/useSiteContent";
import useSiteT from "../../shared/useSiteT";
import {
  pageShows,
  readyPageHref,
  sitePagePath,
} from "../../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteTemplateProps } from "../../template.types";
import styles from "./Atelier.module.css";

/**
 * Delicate and pastel, for handmade and personalised pieces: a watercolour
 * veil over the photo, an organic frame, arched product frames.
 */
const Atelier = ({
  site,
  store,
  products,
  mode,
  cart,
  page,
}: IStoreSiteTemplateProps) => {
  const t = useSiteT();

  // The menus link to the about section only when the site shows one.
  const hasAbout: boolean = siteHasAbout(site.about, store.about);

  // The home shows every part; each other page shows its own.
  const shows = pageShows(page);

  const homeHref: string = sitePagePath(site.slug);

  // "See the products" leads to them, on this page or on theirs.
  const productsHref: string = shows.products
    ? "#produtos"
    : readyPageHref(
        site.slug,
        site.pages,
        StoreSitesEnum.SitePageType.PRODUCTS,
        "produtos",
      );

  const { hero, marquee } = site;

  const sections: IStoreSiteSection[] = site.sections.filter(
    (section: IStoreSiteSection) => section.isActive,
  );

  const marqueeItems: string[] = marquee.isActive
    ? marquee.items.filter((item: string) => item.trim())
    : [];

  const backgroundImage: string | undefined = cssUrl(heroSlideKeys(hero)[0]);
  const featuredImage: string | undefined = cssUrl(featuredSlideKeys(hero)[0]);
  const { logo, brandName } = getSiteContent({ site, store });

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${
        styles.page
      }`}
    >
      <header className={styles.hero}>
        <HeroBackground hero={hero} className={styles.bg} />
        <div
          className={`${styles.veil} ${backgroundImage ? "" : styles.veilSolid}`}
        />
        <div
          className={styles.wash}
          style={{
            width: 320,
            height: 320,
            left: -80,
            top: -60,
            background: "var(--site-secondary)",
          }}
        />
        <div
          className={styles.wash}
          style={{
            width: 300,
            height: 300,
            right: -60,
            top: -80,
            background: "var(--site-accent)",
            animationDelay: "-6s",
          }}
        />
        <div className={styles.fade} />

        <nav className={styles.nav}>
          <a
            href={homeHref}
            className={`${styles.brand} ${siteSerif.className}`}
          >
            {logo && <img src={logo} alt="" />}
            {brandName}
          </a>
          <span className={styles.links}>
            <SiteMenu
              pages={site.pages}
              siteSlug={site.slug}
              currentKey={page?.key}
              hasAbout={hasAbout}
            />

            {site.signIn?.isVisible !== false && (
              <SiteSignIn
                signIn={site.signIn}
                storeId={site.storeId}
                className={`${styles.bag} ${styles.signIn}`}
                isCompact
              />
            )}
            <button type="button" className={styles.bag} onClick={cart.open}>
              {t("storeSite.public.bag")} ({cart.count})
            </button>
          </span>
        </nav>

        <div
          className={`${styles.heroBody} ${
            featuredImage ? "" : styles.heroBodyAlone
          }`}
        >
          <div className={styles.copy}>
            {hero.tagline && (
              <div className={styles.tag} data-intro="0">
                {hero.tagline}
              </div>
            )}
            <h1
              className={`${styles.title} ${styles.serif} ${siteSerif.className}`}
              data-intro="1"
            >
              {hero.title}
            </h1>
            <svg
              className={styles.squiggle}
              viewBox="0 0 190 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 8 C 20 0, 30 14, 48 7 S 78 0, 96 7 S 126 14, 144 7 S 172 0, 188 7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            {hero.subtitle && (
              <p className={styles.subtitle} data-intro="2">
                {hero.subtitle}
              </p>
            )}
            <a
              href={productsHref}
              className={styles.cta}
              data-shine
              data-intro="3"
            >
              {hero.ctaLabel || t("storeSite.public.seeProducts")}
            </a>
          </div>

          {featuredImage && (
            <div className={styles.figure}>
              <div className={styles.frame} />
              <div className={styles.photo}>
                <ImageSlides
                  keys={featuredSlideKeys(hero)}
                  seconds={hero.featuredSlideSeconds}
                />
              </div>
              <span
                className={styles.chip}
                style={
                  {
                    left: "-4%",
                    top: "10%",
                    "--tilt": "-4deg",
                  } as CSSProperties
                }
              >
                ✿ {t("storeSite.public.handmade")}
              </span>
              <span
                className={styles.chip}
                style={
                  {
                    right: "-2%",
                    bottom: "12%",
                    "--tilt": "3deg",
                    animationDelay: "-3s",
                  } as CSSProperties
                }
              >
                ✎ {t("storeSite.public.personalized")}
              </span>
            </div>
          )}
        </div>
      </header>

      {marqueeItems.length > 0 && (
        <div
          className={`${styles.marquee} ${siteSerif.className}`}
          aria-hidden="true"
        >
          <div className={styles.marqueeTrack}>
            {[0, 1, 2, 3].map((copy: number) =>
              marqueeItems.map((item: string, index: number) => (
                <span key={`${copy}-${index}`}>{item} ❀</span>
              )),
            )}
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <section className={styles.sections}>
          {sections.map((section: IStoreSiteSection, index: number) => (
            <Reveal key={section.key} delay={index * 0.12} effect="zoom">
              <article data-card className={styles.step}>
                {section.imageUrl && (
                  <div
                    className={styles.stepPhoto}
                    data-part="0"
                    data-shine
                    style={{ backgroundImage: cssUrl(section.imageUrl) }}
                  />
                )}
                <h2
                  className={`${styles.stepTitle} ${siteSerif.className}`}
                  data-part="1"
                >
                  {section.title}
                </h2>
                {section.description && (
                  <p className={styles.stepText} data-part="2">
                    {section.description}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </section>
      )}

      {shows.products && (
        <section id="produtos">
          <Reveal effect="blur">
            <h2 className={`${styles.productsTitle} ${siteSerif.className}`}>
              {t("storeSite.public.products")}
            </h2>
          </Reveal>

          {products.length === 0 ? (
            <p className={styles.empty}>{t("storeSite.public.noProducts")}</p>
          ) : (
            <div className={styles.products}>
              {products.map((product: IPublicSiteProduct, index: number) => (
                <Reveal key={product._id} delay={(index % 4) * 0.08}>
                  <article
                    data-card
                    className={`${styles.product} ${
                      product.isAvailable ? "" : styles.soldOut
                    }`}
                  >
                    <div
                      className={styles.productPhoto}
                      data-part="0"
                      data-shine
                      style={{ backgroundImage: cssUrl(product.mainUrl) }}
                      role="img"
                      aria-label={product.name}
                    />
                    <span
                      className={`${styles.productName} ${siteSerif.className}`}
                      data-part="1"
                    >
                      {product.name}
                    </span>
                    <span className={styles.price} data-part="2">
                      {formatSiteMoney(product.price)}
                    </span>
                    <div>
                      <button
                        type="button"
                        className={styles.add}
                        data-part="3"
                        disabled={!product.isAvailable}
                        onClick={() => cart.add(product._id)}
                      >
                        {!product.isAvailable
                          ? t("storeSite.public.unavailable")
                          : cart.quantityOf(product._id) > 0
                            ? t("storeSite.public.inCart", {
                                count: cart.quantityOf(product._id),
                              })
                            : t("storeSite.public.add")}
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {shows.about && (
        <SiteAbout
          about={site.about}
          storeAbout={store.about}
          defaultTitle={t("storeSite.public.about")}
          variant="atelier"
          titleClassName={siteSerif.className}
        />
      )}

      {page && (
        <SitePageBody
          page={page}
          variant="atelier"
          titleClassName={siteSerif.className}
          footer={site.footer}
        />
      )}

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Atelier;
