"use client";

import { CSSProperties } from "react";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import HeroBackground from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import { siteSerif } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
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
import styles from "./Garden.module.css";

const PETALS: { left: string; sway: string; delay: string }[] = [
  { left: "8%", sway: "60px", delay: "0s" },
  { left: "22%", sway: "-30px", delay: "-3s" },
  { left: "38%", sway: "50px", delay: "-6s" },
  { left: "63%", sway: "-50px", delay: "-1.5s" },
  { left: "78%", sway: "40px", delay: "-4.5s" },
  { left: "92%", sway: "-60px", delay: "-7.5s" },
];

const TILTS: string[] = ["-2deg", "1.5deg", "-1.5deg", "2deg"];

/**
 * Sage, peach and cream, everything centred: the photo in an arched window,
 * petals falling, the products as polaroids.
 */
const Garden = ({
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
        <div className={styles.fade} />
        {PETALS.map((petal) => (
          <span
            key={petal.left}
            className={styles.petal}
            aria-hidden="true"
            style={
              {
                left: petal.left,
                "--sway": petal.sway,
                animationDelay: petal.delay,
              } as CSSProperties
            }
          />
        ))}

        <nav className={styles.nav}>
          <span className={styles.navLeft}>
            {store.about && <a href="#sobre">{t("storeSite.public.about")}</a>}
            <a href="#produtos">{t("storeSite.public.products")}</a>
          </span>
          <span className={`${styles.brand} ${siteSerif.className}`}>
            {logo && <img src={logo} alt="" />}
            {brandName}
          </span>
          <span className={styles.navRight}>
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

        <div className={styles.copy}>
          {hero.tagline && <div className={styles.tag}>{hero.tagline}</div>}
          <h1 className={`${styles.title} ${siteSerif.className}`}>
            {hero.title}
          </h1>
          {hero.subtitle && <p className={styles.subtitle}>{hero.subtitle}</p>}
        </div>

        {featuredImage && (
          <div className={styles.stage}>
            <div className={styles.archLine} />
            <div
              className={styles.arch}
              style={{ backgroundImage: featuredImage }}
            />
            <div className={styles.seal} aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="var(--site-bg)" />
                <defs>
                  <path
                    id="garden-seal"
                    d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
                  />
                </defs>
                <text
                  fill="var(--site-primary)"
                  fontSize="9"
                  letterSpacing="2.4"
                  fontWeight="600"
                >
                  <textPath href="#garden-seal">
                    {`${t("storeSite.public.handmade")} • ${t(
                      "storeSite.public.personalized",
                    )} • `.toUpperCase()}
                  </textPath>
                </text>
              </svg>
              <span className={styles.sealMark}>❀</span>
            </div>
          </div>
        )}

        <a href="#produtos" className={styles.cta}>
          {hero.ctaLabel || t("storeSite.public.seeProducts")}
        </a>
      </header>

      {marqueeItems.length > 0 && (
        <div
          className={`${styles.marquee} ${siteSerif.className}`}
          aria-hidden="true"
        >
          <div className={styles.marqueeTrack}>
            {repeatForMarquee(marqueeItems).map(
              (item: string, index: number) => (
                <span key={index}>{item} ❀</span>
              ),
            )}
          </div>
        </div>
      )}

      {sections.map((section: IStoreSiteSection, index: number) => (
        <Reveal key={section.key}>
          <section
            className={`${styles.story} ${
              index % 2 === 1 ? styles.storyFlip : ""
            } ${section.imageUrl ? "" : styles.storyAlone}`}
          >
            {section.imageUrl && (
              <div className={styles.storyPhotoWrap}>
                <div
                  className={styles.storyPhoto}
                  style={{ backgroundImage: cssUrl(section.imageUrl) }}
                />
              </div>
            )}
            <div>
              <h2 className={`${styles.storyTitle} ${siteSerif.className}`}>
                {section.title}
              </h2>
              {section.description && (
                <p className={styles.storyText}>{section.description}</p>
              )}
            </div>
          </section>
        </Reveal>
      ))}

      <section id="produtos">
        <div className={styles.productsHead}>
          <div className={styles.tag}>{t("storeSite.public.availableNow")}</div>
          <h2 className={`${styles.productsTitle} ${siteSerif.className}`}>
            {t("storeSite.public.products")}
          </h2>
        </div>

        {products.length === 0 ? (
          <p className={styles.empty}>{t("storeSite.public.noProducts")}</p>
        ) : (
          <div className={styles.products}>
            {products.map((product: IPublicSiteProduct, index: number) => (
              <Reveal key={product._id} delay={(index % 4) * 0.08}>
                <article
                  className={`${styles.polaroid} ${
                    product.isAvailable ? "" : styles.soldOut
                  }`}
                  style={
                    {
                      "--tilt": TILTS[index % TILTS.length],
                      animationDelay: `${-2 * (index % 4)}s`,
                    } as CSSProperties
                  }
                >
                  <div
                    className={styles.polaroidPhoto}
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
        <Reveal>
          <section id="sobre" className={styles.about}>
            <div className={styles.tag}>{t("storeSite.public.ourStory")}</div>
            <h2 className={`${styles.aboutTitle} ${siteSerif.className}`}>
              {brandName}
            </h2>
            <p className={styles.aboutText}>{store.about}</p>
          </section>
        </Reveal>
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

export default Garden;
