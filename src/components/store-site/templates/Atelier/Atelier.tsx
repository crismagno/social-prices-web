"use client";

import { CSSProperties, ReactNode } from "react";

import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import ImageSlides from "../../shared/ImageSlides";
import HeroBackground, {
  featuredSlideKeys,
  heroSlideKeys,
} from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import {
  productNameOpenProps,
  productPhotoOpenProps,
} from "../../shared/site-product-open";
import { siteSerifClass } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout from "../../shared/SiteAbout";
import SiteSections from "../../shared/blocks/SiteSections";
import {
  SiteHeroButtons,
  SiteHeroExtraText,
  heroColorProps,
  heroViewOf,
} from "../../shared/SiteHero";
import SiteHeader from "../../shared/SiteHeader";
import { heroOptionsOf } from "../../../../shared/business/store-sites/store-site-hero";
import SiteFooter from "../../shared/SiteFooter";
import SitePageBody from "../../shared/SitePageBody";
import SiteThemeVars from "../../shared/SiteThemeVars";
import { ISitePartView, sitePartView } from "../../shared/useSiteContent";
import { getSiteContent } from "../../shared/useSiteContent";
import useSiteCatalog, { ISiteCatalog } from "../../shared/useSiteCatalog";
import useSiteT from "../../shared/useSiteT";
import { readyPageHref } from "../../../../shared/business/store-sites/store-site-pages";
import {
  IStoreSiteBlock,
  siteBlocksOf,
} from "../../../../shared/business/store-sites/store-site-blocks";
import {
  TPartType,
  TTemplatePartType,
  pageSections,
  visiblePageSections,
} from "../../../../shared/business/store-sites/store-site-layout";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteTemplateProps } from "../../template.types";
import styles from "./Atelier.module.css";
import { richTextToPlain } from "../../../../shared/utils/rich-text/rich-text";

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

  // "See the products" leads to them, on this page or on theirs.
  const productsHref: string = shows.products
    ? "#produtos"
    : readyPageHref(
        site.slug,
        site.pages,
        StoreSitesEnum.SitePageType.PRODUCTS,
        "produtos",
      );

  // The entrance as the owner wants it read: hidden lines are not there.
  const hero = heroViewOf(site.hero);

  const backgroundImage: string | undefined = cssUrl(heroSlideKeys(hero)[0]);
  // Hidden by the owner: drawn as an entrance without a picture.
  const featuredImage: string | undefined = heroOptionsOf(hero.options)
    .isFeaturedVisible
    ? cssUrl(featuredSlideKeys(hero)[0])
    : undefined;
  const { logo, brandName } = getSiteContent({ site, store });

  // The template's own parts, drawn wherever the page's sections put them.
  const partsOf = ({
    sections,
    marqueeItems,
    marqueeSeparator,
    about,
  }: ISitePartView): Record<TTemplatePartType, ReactNode> => ({
    [StoreSitesEnum.BlockType.MARQUEE]: (
      <>
        {marqueeItems.length > 0 && (
          <div
            className={`${styles.marquee} ${siteSerifClass}`}
            aria-hidden="true"
          >
            <div className={styles.marqueeTrack}>
              {[0, 1, 2, 3].map((copy: number) =>
                marqueeItems.map((item: string, index: number) => (
                  <span key={`${copy}-${index}`}>
                    {item} {marqueeSeparator ?? "❀"}
                  </span>
                )),
              )}
            </div>
          </div>
        )}
      </>
    ),
    [StoreSitesEnum.BlockType.CARDS]: (
      <>
        {sections.length > 0 && (
          <section className={styles.sections}>
            {sections.map((section: IStoreSiteSection, index: number) => (
              <Reveal key={section.key} delay={index * 0.12} effect="zoom">
                <article
                  data-card
                  data-photo-card="section"
                  className={styles.step}
                >
                  {section.imageUrl && (
                    <div
                      data-photo="section"
                      className={styles.stepPhoto}
                      data-part="0"
                      data-shine
                      style={{ backgroundImage: cssUrl(section.imageUrl) }}
                    />
                  )}
                  <h2
                    className={`${styles.stepTitle} ${siteSerifClass}`}
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
      </>
    ),
    [StoreSitesEnum.BlockType.PRODUCTS]: (
      <>
        {
          <section id="produtos">
            <Reveal effect="blur">
              <h2
                data-products-title
                className={`${styles.productsTitle} ${siteSerifClass}`}
              >
                {catalog.view.title ?? t("storeSite.public.products")}
              </h2>
            </Reveal>

            {catalog.search}

            {catalog.products.length === 0 ? (
              <p className={styles.empty}>{catalog.emptyLabel}</p>
            ) : (
              <div className={styles.products}>
                {catalog.products.map(
                  (product: IPublicSiteProduct, index: number) => (
                    <Reveal key={product._id} delay={(index % 4) * 0.08}>
                      <article
                        data-photo-card="product"
                        data-card
                        className={`${styles.product} ${
                          product.isAvailable ? "" : styles.soldOut
                        }`}
                      >
                        <div
                          className={styles.productPhoto}
                          data-part="0"
                          data-photo="product"
                          data-shine
                          style={{ backgroundImage: cssUrl(product.mainUrl) }}
                          role="img"
                          aria-label={product.name}
                          {...productPhotoOpenProps(
                            product,
                            onProductOpen,
                            t("storeSite.product.open"),
                          )}
                        />
                        {catalog.view.isNameShown && (
                          <span
                            className={`${styles.productName} ${siteSerifClass}`}
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
                        {catalog.view.isDescriptionShown &&
                          product.description && (
                            <span className={base.productDescription}>
                              {richTextToPlain(product.description)}
                            </span>
                          )}
                        <div>
                          <button
                            data-cart-add
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
                                : catalog.view.addLabel ||
                                  t("storeSite.public.add")}
                          </button>
                        </div>
                      </article>
                    </Reveal>
                  ),
                )}
              </div>
            )}
          </section>
        }
      </>
    ),
    [StoreSitesEnum.BlockType.ABOUT]: (
      <>
        {
          <SiteAbout
            about={about}
            storeAbout={store.about}
            defaultTitle={t("storeSite.public.about")}
            variant="atelier"
            titleClassName={siteSerifClass}
          />
        }
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
        {page && (
          <SitePageBody
            page={page}
            variant="atelier"
            titleClassName={siteSerifClass}
            footer={site.footer}
            slug={site.slug}
            isPreview={mode === "preview"}
          />
        )}
      </>
    ),
  });

  // The entrance, drawn wherever the page's sections put it.
  const heroPart: ReactNode = (
    <header {...heroColorProps(hero, styles.hero)}>
      <HeroBackground hero={hero} className={styles.bg} />
      <div
        className={`${styles.veil} ${backgroundImage ? "" : styles.veilSolid}`}
        data-hero="veil"
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
            className={`${styles.title} ${styles.serif} ${siteSerifClass}`}
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
          <SiteHeroExtraText hero={hero} className={styles.subtitle} />
          <SiteHeroButtons
            hero={hero}
            className={styles.cta}
            productsHref={productsHref}
            siteSlug={site.slug}
            pages={site.pages}
            mode={mode}
            intro="3"
          />
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
  );

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${
        styles.page
      }`}
    >
      <SiteHeader site={site} store={store} cart={cart} page={page ?? null} />

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
        marqueeStyle={site.marqueeStyle}
        renderPart={(type: TPartType, section: IStoreSiteBlock) =>
          type === StoreSitesEnum.BlockType.HERO
            ? heroPart
            : partsOf(sitePartView(site, section))[type]
        }
        pages={site.pages}
        siteSlug={site.slug}
        variant="atelier"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="atelier"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Atelier;
