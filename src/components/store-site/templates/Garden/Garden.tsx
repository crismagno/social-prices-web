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
import { siteSerif } from "../../shared/site-fonts";
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
import styles from "./Garden.module.css";
import { richTextToPlain } from "../../../../shared/utils/rich-text/rich-text";

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
          <div
            className={`${styles.marquee} ${siteSerif.className}`}
            aria-hidden="true"
          >
            <div className={styles.marqueeTrack}>
              {repeatForMarquee(marqueeItems).map(
                (item: string, index: number) => (
                  <span key={index}>
                    {item} {marqueeSeparator ?? "❀"}
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
              className={`${styles.story} ${
                index % 2 === 1 ? styles.storyFlip : ""
              } ${section.imageUrl ? "" : styles.storyAlone}`}
            >
              {section.imageUrl && (
                <div
                  data-photo="section"
                  className={styles.storyPhotoWrap}
                  data-part="0"
                >
                  <div
                    className={styles.storyPhoto}
                    data-shine
                    style={{ backgroundImage: cssUrl(section.imageUrl) }}
                  />
                </div>
              )}
              <div>
                <h2
                  className={`${styles.storyTitle} ${siteSerif.className}`}
                  data-part="1"
                >
                  {section.title}
                </h2>
                {section.description && (
                  <p className={styles.storyText} data-part="2">
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
              <div className={styles.productsHead}>
                <div className={styles.tag}>
                  {t("storeSite.public.availableNow")}
                </div>
                <h2
                  data-products-title
                  className={`${styles.productsTitle} ${siteSerif.className}`}
                >
                  {catalog.view.title ?? t("storeSite.public.products")}
                </h2>
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
                            className={`${styles.productName} ${siteSerif.className}`}
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
            about={site.about}
            storeAbout={store.about}
            defaultTitle={brandName}
            kicker={t("storeSite.public.ourStory")}
            variant="garden"
            titleClassName={siteSerif.className}
          />
        }
      </>
    ),
    [StoreSitesEnum.BlockType.PAGE_BODY]: (
      <>
        {page && (
          <SitePageBody
            page={page}
            variant="garden"
            titleClassName={siteSerif.className}
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

      {isHeroFirst && (
        <nav className={styles.nav}>
          <span className={styles.navLeft}>
            <SiteMenu
              pages={site.pages}
              siteSlug={site.slug}
              currentKey={page?.key}
              hasAbout={hasAbout}
            />
          </span>
          <a
            href={homeHref}
            className={`${styles.brand} ${siteSerif.className}`}
          >
            {logo && <img src={logo} alt="" />}
            {brandName}
          </a>
          <span className={styles.navRight}>
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
              defaultLabelKey="storeSite.public.bag"
              countFormat="paren"
            />
          </span>
        </nav>
      )}

      <div className={styles.copy}>
        {hero.tagline && (
          <div className={styles.tag} data-intro="0">
            {hero.tagline}
          </div>
        )}
        <h1 className={`${styles.title} ${siteSerif.className}`} data-intro="1">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className={styles.subtitle} data-intro="2">
            {hero.subtitle}
          </p>
        )}
        <SiteHeroExtraText hero={hero} className={styles.subtitle} />
      </div>

      {featuredImage && (
        <div className={styles.stage}>
          <div className={styles.archLine} />
          <div className={styles.arch}>
            <ImageSlides
              keys={featuredSlideKeys(hero)}
              seconds={hero.featuredSlideSeconds}
            />
          </div>
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

      <SiteHeroButtons
        hero={hero}
        className={styles.cta}
        productsHref={productsHref}
        siteSlug={site.slug}
        pages={site.pages}
        mode={mode}
        intro="3"
      />
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
        variant="garden"
        mode={mode}
      />

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        siteLogo={logo}
        variant="garden"
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Garden;
