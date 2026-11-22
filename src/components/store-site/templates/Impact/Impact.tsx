"use client";

import { IStoreSiteSection } from "../../../../shared/business/store-sites/store-site.interface";
import { IPublicSiteProduct } from "../../../../shared/business/store-sites/store-sites.types";
import HeroBackground from "../../shared/HeroBackground";
import Reveal from "../../shared/Reveal";
import base from "../../shared/site-base.module.css";
import { cssUrl, formatSiteMoney } from "../../shared/site-format";
import SiteFooter from "../../shared/SiteFooter";
import SiteSignIn from "../../shared/SiteSignIn";
import SiteThemeVars from "../../shared/SiteThemeVars";
import {
  addLabel,
  getSiteContent,
  repeatForMarquee,
} from "../../shared/useSiteContent";
import useSiteT from "../../shared/useSiteT";
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
}: IStoreSiteTemplateProps) => {
  const t = useSiteT();

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
          <span className={styles.brand}>
            {logo && <img src={logo} alt="" />}
            {brandName}
          </span>
          <span className={styles.links}>
            {store.about && <a href="#sobre">{t("storeSite.public.about")}</a>}
            <a href="#produtos">{t("storeSite.public.products")}</a>
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
          href="#produtos"
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
            {hero.tagline && <div className={styles.tag}>{hero.tagline}</div>}
            <h1 className={styles.title}>
              {lead}
              {last && (
                <>
                  {" "}
                  <span className={styles.titleOutline}>{last}</span>
                </>
              )}
            </h1>
            {hero.subtitle && (
              <p className={styles.subtitle}>{hero.subtitle}</p>
            )}
            <div className={styles.buttons}>
              <a href="#produtos" className={styles.cta}>
                {hero.ctaLabel || t("storeSite.public.seeProducts")}
              </a>
              {store.about && (
                <a href="#sobre" className={styles.ctaGhost}>
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
            <Reveal key={section.key} delay={index * 0.1}>
              <article className={styles.tile}>
                {section.imageUrl && (
                  <div
                    className={styles.tilePhoto}
                    style={{ backgroundImage: cssUrl(section.imageUrl) }}
                  />
                )}
                <div className={styles.tileShade} />
                <div className={styles.tileBody}>
                  <h2 className={styles.tileTitle}>{section.title}</h2>
                  {section.description && (
                    <p className={styles.tileText}>{section.description}</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </section>
      )}

      <section id="produtos">
        <h2 className={styles.productsTitle}>
          {t("storeSite.public.products")}
        </h2>

        {products.length === 0 ? (
          <p className={styles.empty}>{t("storeSite.public.noProducts")}</p>
        ) : (
          <div className={styles.products}>
            {products.map((product: IPublicSiteProduct, index: number) => (
              <Reveal key={product._id} delay={(index % 4) * 0.07}>
                <article
                  className={`${styles.product} ${
                    product.isAvailable ? "" : styles.soldOut
                  }`}
                >
                  <div
                    className={styles.productPhoto}
                    style={{ backgroundImage: cssUrl(product.mainUrl) }}
                    role="img"
                    aria-label={product.name}
                  />
                  <div className={styles.productBody}>
                    <span className={styles.productName}>{product.name}</span>
                    <span className={styles.price}>
                      {formatSiteMoney(product.price)}
                    </span>
                    <button
                      type="button"
                      className={styles.add}
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

      {store.about && (
        <Reveal>
          <section id="sobre" className={styles.about}>
            <h2 className={styles.aboutTitle}>
              {t("storeSite.public.ourStory")}
            </h2>
            <p className={styles.aboutText}>{store.about}</p>
          </section>
        </Reveal>
      )}

      <SiteFooter
        footer={site.footer}
        brandName={brandName}
        signIn={site.signIn}
        storeId={site.storeId}
      />
    </SiteThemeVars>
  );
};

export default Impact;
