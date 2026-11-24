"use client";

import { ReactNode } from "react";

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
import { siteSerif } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout, { siteHasAbout } from "../../shared/SiteAbout";
import SiteSections from "../../shared/blocks/SiteSections";
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
import useSiteCatalog, { ISiteCatalog } from "../../shared/useSiteCatalog";
import useSiteT from "../../shared/useSiteT";
import {
  readyPageHref,
  sitePagePath,
} from "../../../../shared/business/store-sites/store-site-pages";
import {
  IStoreSiteBlock,
  siteBlocksOf,
} from "../../../../shared/business/store-sites/store-site-blocks";
import {
  TPartType,
  pageSections,
  visiblePageSections,
} from "../../../../shared/business/store-sites/store-site-layout";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteTemplateProps } from "../../template.types";
import styles from "./Riviera.module.css";

/**
 * Serene and editorial: serif letters, an arched window for the photo and
 * a wave closing the entrance.
 */
const Riviera = ({
  site,
  store,
  products,
  mode,
  cart,
  page,
  onProductOpen,
  builder,
}: IStoreSiteTemplateProps) => {
  const t = useSiteT();

  // What each product shows, and the ones the visitor's search left.
  const catalog: ISiteCatalog = useSiteCatalog({
    catalog: site.catalog,
    products,
    page,
  });

  // The menus link to the about section only when the site shows one.
  const hasAbout: boolean = siteHasAbout(site.about, store.about);

  // The home shows every part; each other page shows its own.
  // The sections of this page, in the order the owner put them.
  const shownSections: IStoreSiteBlock[] = visiblePageSections(
    siteBlocksOf(site.blocks),
    page ?? null,
    site.isLayoutCustom === true,
  );

  // What this page shows: the menus link to these parts only when they are here.
  const shows = {
    products: shownSections.some(
      (section: IStoreSiteBlock) =>
        section.type === StoreSitesEnum.BlockType.PRODUCTS,
    ),
    about: shownSections.some(
      (section: IStoreSiteBlock) =>
        section.type === StoreSitesEnum.BlockType.ABOUT,
    ),
  };

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


  // The template's own parts, drawn wherever the page's sections put them.
  const parts: Record<TPartType, ReactNode> = {
    [StoreSitesEnum.BlockType.MARQUEE]: (
      <>
{marqueeItems.length > 0 && (
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {repeatForMarquee(marqueeItems).map(
              (item: string, index: number) => (
                <span key={index}>{item} ☼</span>
              ),
            )}
          </div>
        </div>
      )}
      </>
    ),
    [StoreSitesEnum.BlockType.CARDS]: (
      <>
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
      </>
    ),
    [StoreSitesEnum.BlockType.PRODUCTS]: (
      <>
{(
        <section id="produtos">
          <Reveal effect="blur">
            <h2 className={styles.productsTitle}>
              {t("storeSite.public.products")}
            </h2>
          </Reveal>

          {catalog.search}

          {catalog.products.length === 0 ? (
            <p className={styles.empty}>{catalog.emptyLabel}</p>
          ) : (
            <div className={styles.products}>
              {catalog.products.map((product: IPublicSiteProduct, index: number) => (
                <Reveal key={product._id} delay={(index % 4) * 0.08}>
                  <article
                    data-card
                    className={`${styles.product} ${
                      product.isAvailable ? "" : styles.soldOut
                    }`}
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
                          {catalog.view.isNameShown && (
                            <span
                              className={styles.productName}
                              data-part="1"
                              {...productNameOpenProps(product, onProductOpen)}
                            >
                              {product.name}
                            </span>
                          )}
                          {catalog.view.isPriceShown && (
                            <span className={styles.price} data-part="2">
                              {formatSiteMoney(product.price)}
                            </span>
                          )}
                          {catalog.view.isDescriptionShown && product.description && (
                            <span className={base.productDescription}>
                              {product.description}
                            </span>
                          )}
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
      </>
    ),
    [StoreSitesEnum.BlockType.ABOUT]: (
      <>
{(
        <SiteAbout
          about={site.about}
          storeAbout={store.about}
          defaultTitle={brandName}
          kicker={t("storeSite.public.ourStory")}
          variant="riviera"
          titleClassName={siteSerif.className}
        />
      )}
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
{page && (
        <SitePageBody
          page={page}
          variant="riviera"
          titleClassName={siteSerif.className}
          footer={site.footer}
          slug={site.slug}
          isPreview={mode === "preview"}
        />
      )}
      </>
    ),
  };

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${styles.page} ${siteSerif.variable}`}
    >
      <header className={styles.hero}>
        <HeroBackground hero={hero} className={styles.bg} />
        <div
          className={`${styles.veil} ${backgroundImage ? "" : styles.veilSolid}`}
        />

        <div className={styles.navWrap}>
          <nav className={styles.nav}>
            <a href={homeHref} className={styles.brand}>
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
            <div className={styles.featured}>
              <div className={styles.featuredPhoto}>
                <ImageSlides
                  keys={featuredSlideKeys(hero)}
                  seconds={hero.featuredSlideSeconds}
                />
              </div>
            </div>
          )}
        </div>
        <svg
          className={styles.wave}
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0 30c150-40 300 40 450 0s300-40 450 0 200 30 300 0v30H0z"
          />
        </svg>
      </header>

      <SiteSections
        sections={
          builder
            ? pageSections(
                siteBlocksOf(site.blocks),
                page ?? null,
                site.isLayoutCustom === true,
              )
            : shownSections
        }
        builder={builder}
        renderPart={(type: TPartType) => parts[type]}
        pages={site.pages}
        siteSlug={site.slug}
        variant="riviera"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="riviera"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Riviera;
