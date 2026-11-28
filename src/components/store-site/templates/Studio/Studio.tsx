"use client";

import { CSSProperties, ReactNode } from "react";

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
import { siteRounded } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout, { siteHasAbout } from "../../shared/SiteAbout";
import SiteSections from "../../shared/blocks/SiteSections";
import {
  SiteHeroButtons,
  SiteHeroExtraText,
  heroColorProps,
  heroViewOf,
} from "../../shared/SiteHero";
import SiteHeader from "../../shared/SiteHeader";
import SiteFooter from "../../shared/SiteFooter";
import SitePageBody from "../../shared/SitePageBody";
import SiteProductYears from "../../shared/SiteProductYears";
import SiteThemeVars from "../../shared/SiteThemeVars";
import { ISitePartView, sitePartView } from "../../shared/useSiteContent";
import {
  addLabel,
  getSiteContent,
  repeatForMarquee,
} from "../../shared/useSiteContent";
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
import styles from "./Studio.module.css";
import { richTextToPlain } from "../../../../shared/utils/rich-text/rich-text";

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
    accent: site.theme?.primary,
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

  // "About" leads to it, on this page or on its own.
  const aboutHref: string = shows.about
    ? "#sobre"
    : readyPageHref(
        site.slug,
        site.pages,
        StoreSitesEnum.SitePageType.ABOUT,
        "sobre",
      );

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

  const { backgroundImage, featuredImage, logo, brandName } = getSiteContent({
    site,
    store,
  });

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
          <div className={styles.marquee} aria-hidden="true">
            <div className={styles.marqueeTrack}>
              {repeatForMarquee(marqueeItems).map(
                (item: string, index: number) => (
                  <span key={index}>
                    {item} {marqueeSeparator ?? "✦"}
                  </span>
                ),
              )}
            </div>
          </div>
        )}
      </>
    ),
    [StoreSitesEnum.BlockType.CARDS]: (
      <>
        {
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
            <a href={productsHref} className={styles.highlight}>
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
              <a href={aboutHref} className={styles.highlight}>
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
        }
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
                  data-photo="section"
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
      </>
    ),
    [StoreSitesEnum.BlockType.PRODUCTS]: (
      <>
        {
          <section>
            <Reveal effect="blur">
              <div id="produtos" className={styles.productsHead}>
                <span
                  data-products-title
                  className={`${styles.marker} ${styles.markerAlt}`}
                >
                  {catalog.view.title ?? t("storeSite.public.products")}
                </span>
              </div>
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
                        style={
                          {
                            "--card-color":
                              CARD_COLORS[index % CARD_COLORS.length],
                          } as CSSProperties
                        }
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
                        {catalog.view.isYearsShown && (
                          <SiteProductYears product={product} />
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
                            {addLabel(product, cart, t, catalog.view.addLabel)}
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
            defaultTitle={brandName}
            kicker={t("storeSite.public.ourStory")}
            variant="studio"
          />
        }
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
        {page && (
          <SitePageBody
            page={page}
            variant="studio"
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
      {/* The entrance fades into the page instead of ending in a hard line. */}
      <div className={styles.fade} data-hero="fade" />

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
          <SiteHeroExtraText hero={hero} className={styles.subtitle} />
          <div className={styles.buttons} data-intro="3">
            <SiteHeroButtons
              hero={hero}
              className={styles.cta}
              productsHref={productsHref}
              siteSlug={site.slug}
              pages={site.pages}
              mode={mode}
            />
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
  );

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${
        styles.page
      } ${siteRounded.className}`}
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
        variant="studio"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="studio"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Studio;
