"use client";

import { ReactNode } from "react";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import ImageSlides from "../../shared/ImageSlides";
import { featuredSlideKeys } from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import {
  productNameOpenProps,
  productPhotoOpenProps,
} from "../../shared/site-product-open";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteAbout from "../../shared/SiteAbout";
import SiteBlendBackdrop from "../../shared/SiteBlendBackdrop";
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
import styles from "./Nebula.module.css";
import { richTextToPlain } from "../../../../shared/utils/rich-text/rich-text";

/**
 * Immersive and deep: the photo of the entrance is the background of the
 * whole page, in the site's colours, and everything floats over it as glass.
 */
const Nebula = ({
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

  const { featuredImage, logo, brandName } = getSiteContent({
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
                    {item} {marqueeSeparator ?? "◆"}
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
        {sections.map((section: IStoreSiteSection, index: number) => (
          <Reveal key={section.key} effect={index % 2 === 1 ? "right" : "left"}>
            <section
              className={`${styles.block} ${index % 2 === 1 ? styles.blockFlip : ""} ${
                section.imageUrl ? "" : styles.blockAlone
              }`}
            >
              {section.imageUrl && (
                <div data-photo="section" className={styles.blockPhotoWrap}>
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
                    <Reveal key={product._id} delay={(index % 4) * 0.08}>
                      <article
                        data-photo-card="product"
                        data-card
                        className={`${styles.product} ${
                          product.isAvailable ? "" : styles.soldOut
                        }`}
                        style={{ animationDelay: `${-1.5 * (index % 4)}s` }}
                      >
                        <div
                          data-photo-card="product"
                          className={styles.productInner}
                        >
                          <div
                            className={styles.productPhotoClip}
                            data-part="0"
                            data-photo="product"
                            data-shine
                          >
                            <div
                              className={styles.productPhoto}
                              style={{
                                backgroundImage: cssUrl(product.mainUrl),
                              }}
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
                                  {...productNameOpenProps(
                                    product,
                                    onProductOpen,
                                  )}
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
                            </span>
                            <button
                              data-cart-add
                              type="button"
                              className={styles.add}
                              data-part="3"
                              disabled={!product.isAvailable}
                              onClick={() => cart.add(product._id)}
                            >
                              {addLabel(
                                product,
                                cart,
                                t,
                                catalog.view.addLabel,
                              )}
                            </button>
                          </div>
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
            variant="aurora"
          />
        }
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
        {page && (
          <SitePageBody
            page={page}
            variant="aurora"
            footer={site.footer}
            slug={site.slug}
            isPreview={mode === "preview"}
          />
        )}
      </>
    ),
  });

  // The entrance, drawn wherever the page's sections put it. It has no
  // background of its own: the page's is behind it.
  const heroPart: ReactNode = (
    <header {...heroColorProps(hero, styles.hero)}>
      <div className={styles.heroBody}>
        {hero.tagline && (
          <div className={styles.tag} data-intro="0">
            <span className={styles.tagDot} />
            {hero.tagline}
          </div>
        )}
        <h1 className={styles.title}>{hero.title}</h1>
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
          suffix=" →"
        />

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
      <span className={styles.scrollCue} />
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
      <SiteBlendBackdrop
        hero={hero}
        variant="nebula"
        siteBackdrop={site.backdrop}
      />

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

export default Nebula;
