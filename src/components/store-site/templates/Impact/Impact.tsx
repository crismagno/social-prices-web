"use client";

import { ReactNode } from "react";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import HeroBackground from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import {
  productNameOpenProps,
  productPhotoOpenProps,
} from "../../shared/site-product-open";
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
import styles from "./Impact.module.css";
import { richTextToPlain } from "../../../../shared/utils/rich-text/rich-text";

/** The last word of the title is drawn as an outline; a one-word title is not split. */
const splitTitle = (title: string): { lead: string; last: string | null } => {
  const words: string[] = title.trim().split(/\s+/);

  return words.length < 2
    ? { lead: title, last: null }
    : { lead: words.slice(0, -1).join(" "), last: words[words.length - 1] };
};

/**
 * Dark and loud: a giant uppercase title with an outlined word, a diagonal cut
 * of color over the photo, a spinning badge, tiles and cards that react.
 */
const Impact = ({
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

  const { backgroundImage, logo, brandName } = getSiteContent({
    site,
    store,
  });

  const { lead, last } = splitTitle(hero.title);

  const badgeText: string = `${hero.tagline || brandName} • ${t(
    "storeSite.public.seeProducts",
  )} • `.toUpperCase();

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
                    {item} {marqueeSeparator ?? "—"}
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
        {sections.length > 0 && (
          <section className={styles.tiles}>
            {sections.map((section: IStoreSiteSection, index: number) => (
              <Reveal key={section.key} delay={index * 0.1} effect="zoom">
                <article data-card data-photo="section" className={styles.tile}>
                  {section.imageUrl && (
                    <div
                      className={styles.tilePhoto}
                      style={{ backgroundImage: cssUrl(section.imageUrl) }}
                    />
                  )}
                  <div className={styles.tileShade} />
                  <div className={styles.tileBody}>
                    <h2 className={styles.tileTitle} data-part="1">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className={styles.tileText} data-part="2">
                        {section.description}
                      </p>
                    )}
                  </div>
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
              <h2 data-products-title className={styles.productsTitle}>
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
                    <Reveal key={product._id} delay={(index % 4) * 0.07}>
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
                        <div className={styles.productBody}>
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
                          {catalog.view.isDescriptionShown &&
                            product.description && (
                              <span className={base.productDescription}>
                                {richTextToPlain(product.description)}
                              </span>
                            )}
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
            defaultTitle={t("storeSite.public.ourStory")}
            kicker={brandName}
            variant="impact"
          />
        }
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
        {page && (
          <SitePageBody
            page={page}
            variant="impact"
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
        className={`${styles.cut} ${backgroundImage ? "" : styles.cutSolid}`}
        data-hero="fade"
      />

      <a
        href={productsHref}
        className={styles.badge}
        aria-hidden="true"
        tabIndex={-1}
      >
        <svg viewBox="0 0 100 100">
          <defs>
            <path
              id="impact-badge"
              d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"
            />
          </defs>
          <text
            fill="var(--site-text)"
            fontSize="9"
            fontWeight="700"
            letterSpacing="2"
          >
            <textPath href="#impact-badge" textLength="246">
              {badgeText}
            </textPath>
          </text>
        </svg>
        <span className={styles.badgeDot}>↓</span>
      </a>

      <div className={styles.heroBody}>
        <div className={styles.copy}>
          {hero.tagline && (
            <div className={styles.tag} data-intro="0">
              {hero.tagline}
            </div>
          )}
          <h1 className={styles.title} data-intro="1">
            {lead}
            {last && (
              <>
                {" "}
                <span className={styles.titleOutline}>{last}</span>
              </>
            )}
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
            {hasAbout && (
              <a href={aboutHref} className={styles.ctaGhost}>
                {t("storeSite.public.ourStory")}
              </a>
            )}
          </div>
        </div>
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
        variant="impact"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="impact"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Impact;
