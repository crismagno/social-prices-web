"use client";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import ImageSlides from "../../shared/ImageSlides";
import HeroBackground, { featuredSlideKeys } from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import {
  productNameOpenProps,
  productPhotoOpenProps,
} from "../../shared/site-product-open";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout, { siteHasAbout } from "../../shared/SiteAbout";
import SiteBlocks from "../../shared/blocks/SiteBlocks";
import SiteFooter from "../../shared/SiteFooter";
import SiteMenu from "../../shared/SiteMenu";
import SitePageBody from "../../shared/SitePageBody";
import SiteSignIn from "../../shared/SiteSignIn";
import SiteThemeVars from "../../shared/SiteThemeVars";
import {
  addLabel,
  getSiteContent,
  repeatForMarquee,
} from "../../shared/useSiteContent";
import useSiteT from "../../shared/useSiteT";
import {
  pageShows,
  readyPageHref,
  sitePagePath,
} from "../../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
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
  page,
  onProductOpen,
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
            <a href={homeHref} className={styles.brand}>
              {logo && <img src={logo} alt="" />}✦ {brandName}
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
            {hero.tagline && (
              <div className={styles.tag} data-intro="0">
                {hero.tagline}
              </div>
            )}
            <h1 className={styles.title}>{hero.title}</h1>
            {hero.subtitle && (
              <p className={styles.subtitle} data-intro="2">
                {hero.subtitle}
              </p>
            )}
            <a href={productsHref} className={styles.cta} data-shine>
              {hero.ctaLabel || t("storeSite.public.seeProducts")} →
            </a>
          </div>

          {featuredImage && (
            <div className={styles.glass}>
              <div className={styles.glassPhoto}>
                <ImageSlides
                  keys={featuredSlideKeys(hero)}
                  seconds={hero.featuredSlideSeconds}
                />
              </div>
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
        <Reveal key={section.key} effect={index % 2 === 1 ? "right" : "left"}>
          <section
            className={`${styles.block} ${index % 2 === 1 ? styles.blockFlip : ""} ${
              section.imageUrl ? "" : styles.blockAlone
            }`}
          >
            {section.imageUrl && (
              <div className={styles.blockPhotoWrap}>
                <div
                  className={styles.blockPhoto}
                  data-shine
                  style={{ backgroundImage: cssUrl(section.imageUrl) }}
                />
              </div>
            )}
            <div>
              <h2 className={styles.blockTitle} data-part="1">
                {section.title}
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

      {shows.products && (
        <section id="produtos">
          <Reveal effect="blur">
            <h2 className={styles.productsTitle}>
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
                    style={{ animationDelay: `${-1.5 * (index % 4)}s` }}
                  >
                    <div className={styles.productInner}>
                      <div
                        className={styles.productPhotoClip}
                        data-part="0"
                        data-shine
                      >
                        <div
                          className={styles.productPhoto}
                          style={{ backgroundImage: cssUrl(product.mainUrl) }}
                          role="img"
                          aria-label={product.name}
                          {...productPhotoOpenProps(
                            product,
                            onProductOpen,
                            t("storeSite.product.open"),
                          )}
                        />
                      </div>
                      <div className={styles.productBody}>
                        <span>
                          <span
                            className={styles.productName}
                            data-part="1"
                            {...productNameOpenProps(product, onProductOpen)}
                          >
                            {product.name}
                          </span>
                          <span className={styles.price} data-part="2">
                            {formatSiteMoney(product.price)}
                          </span>
                        </span>
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
          defaultTitle={brandName}
          kicker={t("storeSite.public.ourStory")}
          variant="aurora"
        />
      )}

      {page && (
        <SitePageBody
          page={page}
          variant="aurora"
          footer={site.footer}
          slug={site.slug}
          isPreview={mode === "preview"}
        />
      )}

      <SiteBlocks
        blocks={site.blocks}
        pages={site.pages}
        siteSlug={site.slug}
        pageKey={page?.key ?? null}
        variant="aurora"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="aurora"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Aurora;
