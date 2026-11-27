"use client";

import {
  IStoreSiteBackdrop,
  siteBackdropOf,
} from "../../../shared/business/store-sites/store-site-backdrop";
import { IStoreSiteHero } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import HeroBackground, { heroSlideKeys } from "./HeroBackground";
import styles from "./SiteBlendBackdrop.module.css";

/** How the photo is blended with the site's colours: each template's own. */
export type TSiteBlendVariant = "nebula" | "lumen";

interface Props {
  hero: IStoreSiteHero;
  variant: TSiteBlendVariant;
  /** The backdrop the owner set for the site: when there is one, it is used. */
  siteBackdrop?: Partial<IStoreSiteBackdrop> | null;
}

/**
 * The background of a template that floats over its own photo: the photo of
 * the entrance stays behind the whole page as it scrolls, blended with the
 * site's colours, which keep moving over it. Without a photo the colours are
 * the background. The page that uses it must isolate its own stacking
 * (`isolation: isolate`), so this stays behind its content and above its
 * plain background.
 */
const SiteBlendBackdrop = ({ hero, variant, siteBackdrop }: Props) => {
  // Images or a video the owner put behind the site take this one's place.
  if (siteBackdropOf(siteBackdrop).type !== StoreSitesEnum.BackdropType.COLOR) {
    return null;
  }

  return (
    <div
      className={`${styles.backdrop} ${styles[variant]}`}
      data-photo-on={heroSlideKeys(hero).length > 0 ? "" : undefined}
      aria-hidden="true"
    >
      <div className={styles.mesh} />
      <HeroBackground hero={hero} className={styles.photo} />
      <div className={styles.tint} />
      <div className={`${styles.orb} ${styles.orbOne}`} />
      <div className={`${styles.orb} ${styles.orbTwo}`} />
      <div className={styles.veil} />
      <div className={styles.grain} />
    </div>
  );
};

export default SiteBlendBackdrop;
