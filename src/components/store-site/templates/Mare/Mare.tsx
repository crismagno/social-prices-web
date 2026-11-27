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
import { siteFraunces } from "../../shared/site-fonts";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout, { siteHasAbout } from "../../shared/SiteAbout";
import SiteSections from "../../shared/blocks/SiteSections";
import {
  SiteHeroButtons,
  SiteHeroExtraText,
  heroColorProps,
  heroViewOf,
} from "../../shared/SiteHero";
import SiteCartButton from "../../shared/SiteCartButton";
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
  TTemplatePartType,
  pageSections,
  visiblePageSections,
} from "../../../../shared/business/store-sites/store-site-layout";
import { siteMarqueeStyleOf } from "../../../../shared/business/store-sites/store-site-marquee-style";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteTemplateProps } from "../../template.types";
import styles from "./Mare.module.css";
import { richTextToPlain } from "../../../../shared/utils/rich-text/rich-text";

/** The title with its last word apart: that one is set in italics. */
const splitLast = (title: string): { lead: string; last: string } => {
  const words: string[] = title.trim().split(/\s+/);

  return words.length > 1
    ? { lead: words.slice(0, -1).join(" "), last: words[words.length - 1] }
    : { lead: "", last: title.trim() };
};

/**
 * How many columns the last tile of the mosaic takes so the grid has no
 * hole: the first tile fills two rows, beside it two rows of two, then rows
 * of three.
 */
const lastTileSpan = (count: number): number => {
  if (count <= 3) {
    return 1;
  }

  if (count <= 5) {
    return 1 + (5 - count);
  }

  const rest: number = (count - 5) % 3;

  return rest === 0 ? 1 : 1 + (3 - rest);
};

/**
 * Calm and natural, in sand, clay and sea blue: a light bar on top, a sand
 * panel with the title beside an arched photo, a mosaic of sections and a
 * grid of square products. A soft serif with a true italic speaks for it.
 */
const Mare = ({
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

  // The symbol between the phrases of the strip: the owner's, else the template's.
  const marqueeSeparator: string | null = siteMarqueeStyleOf(
    site.marqueeStyle,
  ).separator;

  // What each product shows, and the ones the visitor's search left.
  const catalog: ISiteCatalog = useSiteCatalog({
    catalog: site.catalog,
    products,
    page,
  });

  // The menus link to the about section only when the site shows one.
  const hasAbout: boolean = siteHasAbout(site.about, store.about);

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

  // The entrance as the owner wants it read: hidden lines are not there.
  const hero = heroViewOf(site.hero);

  const {
    sections,
    marqueeItems,
    backgroundImage,
    featuredImage,
    logo,
    brandName,
  } = getSiteContent({ site, store });

  const { lead, last } = splitLast(hero.title);

  // The template's own parts, drawn wherever the page's sections put them.
  const parts: Record<TTemplatePartType, ReactNode> = {
    [StoreSitesEnum.BlockType.MARQUEE]: marqueeItems.length > 0 && (
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {repeatForMarquee(marqueeItems).map((item: string, index: number) => (
            <span key={index}>
              {item} <i>{marqueeSeparator ?? "≈"}</i>
            </span>
          ))}
        </div>
      </div>
    ),
    [StoreSitesEnum.BlockType.CARDS]: sections.length > 0 && (
      <section
        className={`${styles.mosaic} ${
          sections.length === 1
            ? styles.mosaicOne
            : sections.length === 2
              ? styles.mosaicTwo
              : sections.length === 3
                ? styles.mosaicThree
                : ""
        }`}
      >
        {sections.map((section: IStoreSiteSection, index: number) => (
          <Reveal
            key={section.key}
            delay={index * 0.1}
            effect="zoom"
            photo="section"
            className={`${styles.tile} ${
              index === 0 && sections.length > 2 ? styles.tileBig : ""
            }`}
            style={
              index === sections.length - 1 && index > 0
                ? { gridColumn: `span ${lastTileSpan(sections.length)}` }
                : undefined
            }
          >
            {section.imageUrl ? (
              <div
                className={styles.tilePhoto}
                data-part="0"
                data-shine
                style={{ backgroundImage: cssUrl(section.imageUrl) }}
              />
            ) : (
              <span className={styles.tileGlyph} data-part="0">
                ≈
              </span>
            )}
            <div className={styles.tileCaption}>
              <h2 className={styles.tileTitle} data-part="1">
                {section.title}
              </h2>
              {section.description && (
                <p className={styles.tileText} data-part="2">
                  {section.description}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </section>
    ),
    [StoreSitesEnum.BlockType.PRODUCTS]: (
      <section id="produtos" className={styles.shop}>
        <Reveal effect="up">
          <h2 data-products-title className={styles.shopTitle}>
            {catalog.view.title ?? t("storeSite.public.products")}
          </h2>
        </Reveal>

        {catalog.search}

        {catalog.products.length === 0 ? (
          <p className={styles.empty}>{catalog.emptyLabel}</p>
        ) : (
          <div className={styles.grid}>
            {catalog.products.map(
              (product: IPublicSiteProduct, index: number) => (
                <Reveal key={product._id} delay={(index % 4) * 0.08}>
                  <article
                    data-photo-card="product"
                    data-card
                    className={`${styles.item} ${
                      product.isAvailable ? "" : styles.soldOut
                    }`}
                  >
                    <div
                      className={styles.itemPhotoClip}
                      data-part="0"
                      data-photo="product"
                    >
                      <div
                        className={styles.itemPhoto}
                        style={{ backgroundImage: cssUrl(product.mainUrl) }}
                        role="img"
                        aria-label={product.name}
                        {...productPhotoOpenProps(
                          product,
                          onProductOpen,
                          t("storeSite.product.open"),
                        )}
                      />
                      <button
                        data-cart-add
                        type="button"
                        className={styles.plus}
                        aria-label={addLabel(
                          product,
                          cart,
                          t,
                          catalog.view.addLabel,
                        )}
                        title={addLabel(
                          product,
                          cart,
                          t,
                          catalog.view.addLabel,
                        )}
                        disabled={!product.isAvailable}
                        onClick={() => cart.add(product._id)}
                      >
                        {cart.quantityOf(product._id) > 0
                          ? cart.quantityOf(product._id)
                          : "+"}
                      </button>
                    </div>
                    <div className={styles.itemInfo} data-part="1">
                      {catalog.view.isNameShown && (
                        <span
                          className={styles.itemName}
                          {...productNameOpenProps(product, onProductOpen)}
                        >
                          {product.name}
                        </span>
                      )}
                      <span className={styles.price}>
                        {product.isAvailable
                          ? catalog.view.isPriceShown &&
                            formatSiteMoney(product.price)
                          : t("storeSite.public.unavailable")}
                      </span>
                      {catalog.view.isDescriptionShown &&
                        product.description && (
                          <span className={base.productDescription}>
                            {richTextToPlain(product.description)}
                          </span>
                        )}
                    </div>
                  </article>
                </Reveal>
              ),
            )}
          </div>
        )}
      </section>
    ),
    [StoreSitesEnum.BlockType.ABOUT]: (
      <SiteAbout
        about={site.about}
        storeAbout={store.about}
        defaultTitle={brandName}
        kicker={t("storeSite.public.ourStory")}
        variant="mare"
        titleClassName={styles.serif}
      />
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: page && (
      <SitePageBody
        page={page}
        variant="mare"
        titleClassName={styles.serif}
        footer={site.footer}
        slug={site.slug}
        isPreview={mode === "preview"}
      />
    ),
  };

  // The entrance, drawn wherever the page's sections put it.
  const heroPart: ReactNode = (
    <header {...heroColorProps(hero, styles.hero)}>
      <div className={styles.panel}>
        {backgroundImage && (
          <>
            <HeroBackground hero={hero} className={styles.bg} />
            <div className={styles.veil} data-hero="veil" />
          </>
        )}

        <div
          className={`${styles.heroBody} ${
            featuredImage ? "" : styles.heroBodyAlone
          }`}
        >
          <div className={styles.copy}>
            {hero.tagline && (
              <span className={styles.tag} data-intro="0">
                {hero.tagline}
              </span>
            )}
            <h1 className={styles.title}>
              {lead && <>{lead} </>}
              <em>{last}</em>
            </h1>
            {hero.subtitle && (
              <p className={styles.subtitle} data-intro="2">
                {hero.subtitle}
              </p>
            )}
            <SiteHeroExtraText hero={hero} className={styles.subtitle} />
            <div className={styles.actions} data-intro="3">
              <SiteHeroButtons
                hero={hero}
                className={styles.cta}
                productsHref={productsHref}
                siteSlug={site.slug}
                pages={site.pages}
                mode={mode}
                suffix=" →"
              />
            </div>
          </div>

          {featuredImage && (
            <div className={styles.featured}>
              <div className={styles.arch}>
                <ImageSlides
                  keys={featuredSlideKeys(hero)}
                  seconds={hero.featuredSlideSeconds}
                />
              </div>
              <span className={styles.seal} aria-hidden="true">
                {logo ? <img src={logo} alt="" /> : <b>≈</b>}
              </span>
            </div>
          )}
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
      } ${siteFraunces.variable}`}
    >
      <nav className={styles.bar}>
        <a href={homeHref} className={styles.brand}>
          <span className={styles.brandMark}>
            {logo ? <img src={logo} alt="" /> : "≈"}
          </span>
          {brandName}
        </a>
        <span className={styles.links}>
          <SiteMenu
            pages={site.pages}
            siteSlug={site.slug}
            currentKey={page?.key}
            hasAbout={hasAbout}
          />
        </span>
        <span className={styles.barEnd}>
          {site.signIn?.isVisible !== false && (
            <SiteSignIn
              signIn={site.signIn}
              storeId={site.storeId}
              className={styles.signIn}
              isCompact
            />
          )}
          <SiteCartButton
            settings={site.cartButton}
            cart={cart}
            className={styles.bag}
            defaultLabelKey="storeSite.public.cart"
            countFormat="badge"
          />
        </span>
      </nav>

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
        renderPart={(type: TPartType) =>
          type === StoreSitesEnum.BlockType.HERO ? heroPart : parts[type]
        }
        pages={site.pages}
        siteSlug={site.slug}
        variant="mare"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="mare"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Mare;
