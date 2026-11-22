"use client";

import { CSSProperties } from "react";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import ImageSlides from "../../shared/ImageSlides";
import HeroBackground, { featuredSlideKeys } from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import { siteRounded } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout, { siteHasAbout } from "../../shared/SiteAbout";
import SiteFooter from "../../shared/SiteFooter";
import SiteSignIn from "../../shared/SiteSignIn";
import SiteThemeVars from "../../shared/SiteThemeVars";
import {
  addLabel,
  getSiteContent,
  repeatForMarquee,
} from "../../shared/useSiteContent";
import useSiteT from "../../shared/useSiteT";
import { IStoreSiteTemplateProps } from "../../template.types";
import styles from "./Studio.module.css";

// The cards and circles walk through the site's own colors.
const CARD_COLORS: string[] = [
  "var(--site-accent)",
  "var(--site-secondary)",
  "var(--site-primary)",
];

const sectionAnchor = (section: IStoreSiteSection): string =>
  `bloco-${section.key}`;

/**
 * Warm and playful: thick rounded letters, twinkling stars, highlighter
 * titles, circles that work as the page's menu, color-block product cards.
 */
const Studio = ({
  site,
  store,
  products,
  mode,
  cart,
}: IStoreSiteTemplateProps) => {
  const t = useSiteT();

  // The menus link to the about section only when the site shows one.
  const hasAbout: boolean = siteHasAbout(site.about, store.about);

  const { hero } = site;

  const {
    sections,
    marqueeItems,
    backgroundImage,
    featuredImage,
    logo,
    brandName,
  } = getSiteContent({ site, store });

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${
        styles.page
      } ${siteRounded.className}`}
    >
      <header className={styles.hero}>
        <HeroBackground hero={hero} className={styles.bg} />
        <div
          className={`${styles.veil} ${backgroundImage ? "" : styles.veilSolid}`}
        />

        <nav className={styles.nav}>
          <span className={styles.brand}>
            {logo && <img src={logo} alt="" />}
            {brandName}
          </span>
          <span className={styles.links}>
            <a href="#produtos" data-navlink>
              {t("storeSite.public.products")}
            </a>
            {hasAbout && (
              <a href="#sobre" data-navlink>
                {t("storeSite.public.about")}
              </a>
            )}
            {site.signIn?.isVisible !== false && (
              <SiteSignIn
                signIn={site.signIn}
                storeId={site.storeId}
                className={`${styles.bag} ${styles.signIn}`}
                isCompact
              />
            )}
            <button type="button" className={styles.bag} onClick={cart.open}>
              {t("storeSite.public.bag")} · {cart.count}
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
              <span className={styles.pill} data-intro="0">
                {hero.tagline} ✿
              </span>
            )}
            <h1 className={styles.title} data-intro="1">
              <span className={styles.star} aria-hidden="true">
                ✦
              </span>{" "}
              {hero.title}{" "}
              <span
                className={styles.star}
                style={{ animationDelay: "-1s" }}
                aria-hidden="true"
              >
                ✦
              </span>
            </h1>
            {hero.subtitle && (
              <p className={styles.subtitle} data-intro="2">
                {hero.subtitle}
              </p>
            )}
            <div className={styles.buttons} data-intro="3">
              <a href="#produtos" className={styles.cta} data-shine>
                {hero.ctaLabel || t("storeSite.public.seeProducts")}
              </a>
              {hasAbout && (
                <a href="#sobre" className={styles.ctaLight}>
                  {t("storeSite.public.about")}
                </a>
              )}
            </div>
          </div>

          {featuredImage && (
            <div className={styles.figure}>
              <div
                className={styles.pic}
                style={{ "--tilt": "3deg" } as CSSProperties}
              >
                <ImageSlides
                  keys={featuredSlideKeys(hero)}
                  seconds={hero.featuredSlideSeconds}
                />
              </div>
              <span
                className={styles.sticker}
                style={
                  {
                    left: "-8%",
                    top: "-4%",
                    "--tilt": "-10deg",
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                🌸
              </span>
              <span
                className={styles.sticker}
                style={
                  {
                    right: "-6%",
                    bottom: "6%",
                    "--tilt": "8deg",
                    animationDelay: "-2.5s",
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                🌼
              </span>
            </div>
          )}
        </div>
      </header>

      {marqueeItems.length > 0 && (
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {repeatForMarquee(marqueeItems).map(
              (item: string, index: number) => (
                <span key={index}>{item} ✦</span>
              ),
            )}
          </div>
        </div>
      )}

      <nav
        className={styles.highlights}
        aria-label={t("storeSite.public.news")}
      >
        {sections.map((section: IStoreSiteSection, index: number) => (
          <a
            key={section.key}
            href={`#${sectionAnchor(section)}`}
            className={styles.highlight}
          >
            <span className={styles.ring}>
              <span
                className={styles.ringFill}
                style={{
                  backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
                  backgroundImage: cssUrl(section.imageUrl),
                }}
              >
                {!section.imageUrl && "❦"}
              </span>
            </span>
            <span className={styles.highlightLabel}>{section.title}</span>
          </a>
        ))}
        <a href="#produtos" className={styles.highlight}>
          <span className={styles.ring}>
            <span
              className={styles.ringFill}
              style={{ backgroundColor: "var(--site-secondary)" }}
            >
              ❦
            </span>
          </span>
          <span className={styles.highlightLabel}>
            {t("storeSite.public.products")}
          </span>
        </a>
        {hasAbout && (
          <a href="#sobre" className={styles.highlight}>
            <span className={styles.ring}>
              <span
                className={styles.ringFill}
                style={{ backgroundColor: "var(--site-primary)" }}
              >
                ❦
              </span>
            </span>
            <span className={styles.highlightLabel}>
              {t("storeSite.public.about")}
            </span>
          </a>
        )}
      </nav>

      {sections.map((section: IStoreSiteSection, index: number) => (
        <Reveal key={section.key} effect={index % 2 === 1 ? "right" : "left"}>
          <section
            id={sectionAnchor(section)}
            className={`${styles.block} ${index % 2 === 1 ? styles.blockFlip : ""} ${
              section.imageUrl ? "" : styles.blockAlone
            }`}
          >
            {section.imageUrl && (
              <div
                className={styles.blockPhoto}
                data-shine
                style={{ backgroundImage: cssUrl(section.imageUrl) }}
              />
            )}
            <div>
              <h2 className={styles.blockTitle}>
                <span
                  className={`${styles.marker} ${
                    index % 2 === 1 ? styles.markerAlt : ""
                  }`}
                >
                  {section.title}
                </span>
              </h2>
              {section.description && (
                <p className={styles.blockText} data-part="2">
                  {section.description}
                </p>
              )}
            </div>
          </section>
        </Reveal>
      ))}

      <section>
        <Reveal effect="blur">
          <div id="produtos" className={styles.productsHead}>
            <span className={`${styles.marker} ${styles.markerAlt}`}>
              {t("storeSite.public.products")}
            </span>
          </div>
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
                  style={
                    {
                      "--card-color": CARD_COLORS[index % CARD_COLORS.length],
                    } as CSSProperties
                  }
                >
                  <div
                    className={styles.productPhoto}
                    data-part="0"
                    data-shine
                    style={{ backgroundImage: cssUrl(product.mainUrl) }}
                    role="img"
                    aria-label={product.name}
                  />
                  <span className={styles.productName} data-part="1">
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
                      {addLabel(product, cart, t)}
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SiteAbout
        about={site.about}
        storeAbout={store.about}
        defaultTitle={brandName}
        kicker={t("storeSite.public.ourStory")}
        variant="studio"
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Studio;
