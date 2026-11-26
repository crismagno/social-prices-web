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
import { SiteTopBar } from "../../shared/SiteStickyBar";
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
  isHeroOnTop,
  pageSections,
  visiblePageSections,
} from "../../../../shared/business/store-sites/store-site-layout";
import { siteMarqueeStyleOf } from "../../../../shared/business/store-sites/store-site-marquee-style";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteTemplateProps } from "../../template.types";
import styles from "./Buddy.module.css";

/** A paw print, in the color of whatever holds it. */
const Paw = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="currentColor"
    aria-hidden="true"
  >
    <ellipse cx="13" cy="29" rx="6" ry="8" />
    <ellipse cx="26" cy="16" rx="6" ry="8.5" />
    <ellipse cx="40" cy="16" rx="6" ry="8.5" />
    <ellipse cx="52" cy="29" rx="6" ry="8" />
    <path d="M33 31c-9 0-17 9-17 17 0 6 5 8 9 8 3 0 5-1 8-1s5 1 8 1c4 0 9-2 9-8 0-8-8-17-17-17z" />
  </svg>
);

/**
 * Round and playful: a wobbling blob behind the photo, sticker cards with a
 * hard shadow, and paw prints.
 */
const Buddy = ({
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

  // The template's own parts, drawn wherever the page's sections put them.
  const parts: Record<TTemplatePartType, ReactNode> = {
    [StoreSitesEnum.BlockType.MARQUEE]: (
      <>
        {marqueeItems.length > 0 && (
          <div className={styles.marquee} aria-hidden="true">
            <div className={styles.marqueeTrack}>
              {repeatForMarquee(marqueeItems).map(
                (item: string, index: number) => (
                  <span key={index}>
                    {item} {marqueeSeparator ?? <Paw className={styles.sep} />}
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
                        data-card
                        className={`${styles.product} ${
                          product.isAvailable ? "" : styles.soldOut
                        }`}
                      >
                        <div className={styles.productInner}>
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
                                    {product.description}
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
            about={site.about}
            storeAbout={store.about}
            defaultTitle={brandName}
            kicker={t("storeSite.public.ourStory")}
            variant="buddy"
          />
        }
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
        {page && (
          <SitePageBody
            page={page}
            variant="buddy"
            footer={site.footer}
            slug={site.slug}
            isPreview={mode === "preview"}
          />
        )}
      </>
    ),
  };

  // A page that starts with its entrance has the menu inside it, as the
  // template draws it; any other page gets the menu as a bar of its own.
  const isHeroFirst: boolean = isHeroOnTop(
    builder
      ? pageSections(
          siteBlocksOf(site.blocks),
          page ?? null,
          site.isLayoutCustom === true,
        )
      : shownSections,
  );

  // The entrance, drawn wherever the page's sections put it.
  const heroPart: ReactNode = (
    <header {...heroColorProps(hero, styles.hero)}>
      <HeroBackground hero={hero} className={styles.bg} />
      <div
        className={`${styles.veil} ${backgroundImage ? "" : styles.veilSolid}`}
        data-hero="veil"
      />
      <Paw className={`${styles.paw} ${styles.pawA}`} />
      <Paw className={`${styles.paw} ${styles.pawB}`} />
      <Paw className={`${styles.paw} ${styles.pawC}`} />

      {isHeroFirst && (
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
              <SiteCartButton
                settings={site.cartButton}
                cart={cart}
                className={styles.bag}
                defaultLabelKey="storeSite.public.cart"
                countFormat="dot"
              />
            </span>
          </nav>
        </div>
      )}

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
          <SiteHeroExtraText hero={hero} className={styles.subtitle} />
          <SiteHeroButtons
            hero={hero}
            className={styles.cta}
            productsHref={productsHref}
            siteSlug={site.slug}
            pages={site.pages}
            mode={mode}
          />
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
    </header>
  );

  return (
    <SiteThemeVars
      theme={site.theme}
      sizes={site.sizes}
      className={`${base.root} ${mode === "preview" ? base.preview : ""} ${styles.page} ${siteRounded.className}`}
    >
      {!isHeroFirst && (
        <SiteTopBar site={site} store={store} cart={cart} page={page ?? null} />
      )}

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
        variant="buddy"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="buddy"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Buddy;
