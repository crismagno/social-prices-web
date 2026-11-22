"use client";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import HeroBackground from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
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
import styles from "./Aurora.module.css";

/**
 * Vivid and glassy: the site's colors sweep over the photo, the title is a
 * moving gradient, cards float and their borders glow.
 */
const Aurora = ({
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
      }`}
    >
      <header className={styles.hero}>
        <HeroBackground hero={hero} className={styles.bg} />
        <div
          className={`${styles.tint} ${backgroundImage ? "" : styles.tintSolid}`}
        />
        <div
          className={styles.blob}
          style={{ background: "var(--site-secondary)", left: -60, top: 60 }}
        />
        <div
          className={styles.blob}
          style={{
            background: "var(--site-accent)",
            right: "10%",
            bottom: -80,
            animationDelay: "-4s",
          }}
        />
        <div className={styles.shade} />

        <div className={styles.navWrap}>
          <nav className={styles.nav}>
            <span className={styles.brand}>
              {logo && <img src={logo} alt="" />}✦ {brandName}
            </span>
            <span className={styles.links}>
              {hasAbout && <a href="#sobre">{t("storeSite.public.about")}</a>}
              <a href="#produtos">{t("storeSite.public.products")}</a>
              {site.signIn?.isVisible !== false && (
                <SiteSignIn
                  signIn={site.signIn}
                  storeId={site.storeId}
                  className={`${styles.bag} ${styles.signIn}`}
                  isCompact
                />
              )}
              <button type="button" className={styles.bag} onClick={cart.open}>
                {t("storeSite.public.cart")} · {cart.count}
              </button>
            </span>
          </nav>
        </div>

        <div
          className={`${styles.heroBody} ${
            featuredImage ? "" : styles.heroBodyAlone
          }`}
        >
          <div className={styles.copy}>
            {hero.tagline && <div className={styles.tag}>{hero.tagline}</div>}
            <h1 className={styles.title}>{hero.title}</h1>
            {hero.subtitle && (
              <p className={styles.subtitle}>{hero.subtitle}</p>
            )}
            <a href="#produtos" className={styles.cta}>
              {hero.ctaLabel || t("storeSite.public.seeProducts")} →
            </a>
          </div>

          {featuredImage && (
            <div className={styles.glass}>
              <div
                className={styles.glassPhoto}
                style={{ backgroundImage: featuredImage }}
              />
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

      {sections.map((section: IStoreSiteSection, index: number) => (
        <Reveal key={section.key}>
          <section
            className={`${styles.block} ${index % 2 === 1 ? styles.blockFlip : ""} ${
              section.imageUrl ? "" : styles.blockAlone
            }`}
          >
            {section.imageUrl && (
              <div className={styles.blockPhotoWrap}>
                <div
                  className={styles.blockPhoto}
                  style={{ backgroundImage: cssUrl(section.imageUrl) }}
                />
              </div>
            )}
            <div>
              <h2 className={styles.blockTitle}>{section.title}</h2>
              {section.description && (
                <p className={styles.blockText}>{section.description}</p>
              )}
            </div>
          </section>
        </Reveal>
      ))}

      <section id="produtos">
        <h2 className={styles.productsTitle}>
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
                  style={{ animationDelay: `${-1.5 * (index % 4)}s` }}
                >
                  <div className={styles.productInner}>
                    <div className={styles.productPhotoClip}>
                      <div
                        className={styles.productPhoto}
                        style={{ backgroundImage: cssUrl(product.mainUrl) }}
                        role="img"
                        aria-label={product.name}
                      />
                    </div>
                    <div className={styles.productBody}>
                      <span>
                        <span className={styles.productName}>
                          {product.name}
                        </span>
                        <span className={styles.price}>
                          {formatSiteMoney(product.price)}
                        </span>
                      </span>
                      <button
                        type="button"
                        className={styles.add}
                        disabled={!product.isAvailable}
                        onClick={() => cart.add(product._id)}
                      >
                        {addLabel(product, cart, t)}
                      </button>
                    </div>
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
        titleClassName={styles.aboutTitle}
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

export default Aurora;
