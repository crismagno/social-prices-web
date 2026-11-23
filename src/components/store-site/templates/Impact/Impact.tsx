"use client";

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
import styles from "./Impact.module.css";

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
}: IStoreSiteTemplateProps) => {
  const t = useSiteT();

  // The menus link to the about section only when the site shows one.
  const hasAbout: boolean = siteHasAbout(site.about, store.about);

  // The home shows every part; each other page shows its own.
  const shows = pageShows(page);

  const homeHref: string = sitePagePath(site.slug);

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

  const { hero } = site;

  const { sections, marqueeItems, backgroundImage, logo, brandName } =
    getSiteContent({
      site,
      store,
    });

  const { lead, last } = splitTitle(hero.title);

  const badgeText: string = `${hero.tagline || brandName} • ${t(
    "storeSite.public.seeProducts",
  )} • `.toUpperCase();

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
          className={`${styles.cut} ${backgroundImage ? "" : styles.cutSolid}`}
        />

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
              {t("storeSite.public.cart")} ({cart.count})
            </button>
          </span>
        </nav>

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
            <div className={styles.buttons} data-intro="3">
              <a href={productsHref} className={styles.cta} data-shine>
                {hero.ctaLabel || t("storeSite.public.seeProducts")}
              </a>
              {hasAbout && (
                <a href={aboutHref} className={styles.ctaGhost}>
                  {t("storeSite.public.ourStory")}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {marqueeItems.length > 0 && (
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {repeatForMarquee(marqueeItems).map(
              (item: string, index: number) => (
                <span key={index}>{item} —</span>
              ),
            )}
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <section className={styles.tiles}>
          {sections.map((section: IStoreSiteSection, index: number) => (
            <Reveal key={section.key} delay={index * 0.1} effect="zoom">
              <article data-card className={styles.tile}>
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
                <Reveal key={product._id} delay={(index % 4) * 0.07}>
                  <article
                    data-card
                    className={`${styles.product} ${
                      product.isAvailable ? "" : styles.soldOut
                    }`}
                  >
                    <div
                      className={styles.productPhoto}
                      data-part="0"
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
          defaultTitle={t("storeSite.public.ourStory")}
          kicker={brandName}
          variant="impact"
        />
      )}

      {page && (
        <SitePageBody
          page={page}
          variant="impact"
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
