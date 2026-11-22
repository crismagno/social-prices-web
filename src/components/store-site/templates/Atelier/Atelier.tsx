"use client";

import { CSSProperties } from "react";

import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import { siteSerif } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteThemeVars from "../../shared/SiteThemeVars";
import { getSiteContent } from "../../shared/useSiteContent";
import useSiteT from "../../shared/useSiteT";
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
}: IStoreSiteTemplateProps) => {
  const t = useSiteT();

  const { hero, marquee } = site;

  const sections: IStoreSiteSection[] = site.sections.filter(
    (section: IStoreSiteSection) => section.isActive,
  );

  const marqueeItems: string[] = marquee.isActive
    ? marquee.items.filter((item: string) => item.trim())
    : [];

  const backgroundImage: string | undefined = cssUrl(hero.backgroundImageUrl);
  const featuredImage: string | undefined = cssUrl(hero.featuredImageUrl);
  const { logo, brandName } = getSiteContent({ site, store });

  return (
    <SiteThemeVars
      theme={site.theme}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${
        styles.page
      }`}
    >
      <header className={styles.hero}>
        {backgroundImage && (
          <div className={styles.bg} style={{ backgroundImage }} />
        )}
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
          <span className={`${styles.brand} ${siteSerif.className}`}>
            {logo && <img src={logo} alt="" />}
            {brandName}
          </span>
          <span className={styles.links}>
            {store.about && <a href="#sobre">{t("storeSite.public.about")}</a>}
            <a href="#produtos">{t("storeSite.public.products")}</a>
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
            {hero.tagline && <div className={styles.tag}>{hero.tagline}</div>}
            <h1
              className={`${styles.title} ${styles.serif} ${siteSerif.className}`}
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
              <p className={styles.subtitle}>{hero.subtitle}</p>
            )}
            <a href="#produtos" className={styles.cta}>
              {hero.ctaLabel || t("storeSite.public.seeProducts")}
            </a>
          </div>

          {featuredImage && (
            <div className={styles.figure}>
              <div className={styles.frame} />
              <div
                className={styles.photo}
                style={{ backgroundImage: featuredImage }}
              />
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
            <Reveal key={section.key} delay={index * 0.12}>
              <article className={styles.step}>
                {section.imageUrl && (
                  <div
                    className={styles.stepPhoto}
                    style={{ backgroundImage: cssUrl(section.imageUrl) }}
                  />
                )}
                <h2 className={`${styles.stepTitle} ${siteSerif.className}`}>
                  {section.title}
                </h2>
                {section.description && (
                  <p className={styles.stepText}>{section.description}</p>
                )}
              </article>
            </Reveal>
          ))}
        </section>
      )}

      <section id="produtos">
        <h2 className={`${styles.productsTitle} ${siteSerif.className}`}>
          {t("storeSite.public.products")}
        </h2>

        {products.length === 0 ? (
          <p className={styles.empty}>{t("storeSite.public.noProducts")}</p>
        ) : (
          <div className={styles.products}>
            {products.map((product: IPublicSiteProduct, index: number) => (
              <Reveal key={product._id} delay={(index % 4) * 0.08}>
                <article
                  className={`${styles.product} ${
                    product.isAvailable ? "" : styles.soldOut
                  }`}
                >
                  <div
                    className={styles.productPhoto}
                    style={{ backgroundImage: cssUrl(product.mainUrl) }}
                    role="img"
                    aria-label={product.name}
                  />
                  <span
                    className={`${styles.productName} ${siteSerif.className}`}
                  >
                    {product.name}
                  </span>
                  <span className={styles.price}>
                    {formatSiteMoney(product.price)}
                  </span>
                  <div>
                    <button
                      type="button"
                      className={styles.add}
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

      {store.about && (
        <Reveal>
          <section id="sobre" className={styles.about}>
            <h2 className={`${styles.aboutTitle} ${siteSerif.className}`}>
              {t("storeSite.public.about")}
            </h2>
            <p className={styles.aboutText}>{store.about}</p>
          </section>
        </Reveal>
      )}

      <footer className={styles.footer}>
        {brandName} · {t("storeSite.public.madeWith")}
      </footer>
    </SiteThemeVars>
  );
};

export default Atelier;
