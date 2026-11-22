"use client";

import { CSSProperties } from "react";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import { siteRounded } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
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
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${
        styles.page
      } ${siteRounded.className}`}
    >
      <header className={styles.hero}>
        {backgroundImage && (
          <div className={styles.bg} style={{ backgroundImage }} />
        )}
        <div
          className={`${styles.veil} ${backgroundImage ? "" : styles.veilSolid}`}
        />

        <nav className={styles.nav}>
          <span className={styles.brand}>
            {logo && <img src={logo} alt="" />}
            {brandName}
          </span>
          <span className={styles.links}>
            <a href="#produtos">{t("storeSite.public.products")}</a>
            {store.about && <a href="#sobre">{t("storeSite.public.about")}</a>}
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
              <span className={styles.pill}>{hero.tagline} ✿</span>
            )}
            <h1 className={styles.title}>
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
              <p className={styles.subtitle}>{hero.subtitle}</p>
            )}
            <div className={styles.buttons}>
              <a href="#produtos" className={styles.cta}>
                {hero.ctaLabel || t("storeSite.public.seeProducts")}
              </a>
              {store.about && (
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
                style={
                  {
                    backgroundImage: featuredImage,
                    "--tilt": "3deg",
                  } as CSSProperties
                }
              />
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
        {store.about && (
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
        <Reveal key={section.key}>
          <section
            id={sectionAnchor(section)}
            className={`${styles.block} ${index % 2 === 1 ? styles.blockFlip : ""} ${
              section.imageUrl ? "" : styles.blockAlone
            }`}
          >
            {section.imageUrl && (
              <div
                className={styles.blockPhoto}
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
                <p className={styles.blockText}>{section.description}</p>
              )}
            </div>
          </section>
        </Reveal>
      ))}

      <section>
        <div id="produtos" className={styles.productsHead}>
          <span className={`${styles.marker} ${styles.markerAlt}`}>
            {t("storeSite.public.products")}
          </span>
        </div>

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
                  style={
                    {
                      "--card-color": CARD_COLORS[index % CARD_COLORS.length],
                    } as CSSProperties
                  }
                >
                  <div
                    className={styles.productPhoto}
                    style={{ backgroundImage: cssUrl(product.mainUrl) }}
                    role="img"
                    aria-label={product.name}
                  />
                  <span className={styles.productName}>{product.name}</span>
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
                      {addLabel(product, cart, t)}
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {store.about && (
        <div className={styles.calloutWrap}>
          <Reveal>
            <section id="sobre" className={styles.callout}>
              <h2 className={styles.calloutTitle}>
                <span className={styles.star} aria-hidden="true">
                  ✦
                </span>{" "}
                {brandName}
              </h2>
              <p className={styles.calloutText}>{store.about}</p>
            </section>
          </Reveal>
        </div>
      )}

      <footer className={styles.footer}>
        {brandName} · {t("storeSite.public.madeWith")}
      </footer>
    </SiteThemeVars>
  );
};

export default Studio;
