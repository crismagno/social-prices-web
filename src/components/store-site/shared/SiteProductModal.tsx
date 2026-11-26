"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Modal } from "antd";

import {
  IStoreSiteCatalog,
  siteCatalogOf,
} from "../../../shared/business/store-sites/store-site-catalog";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import {
  IPublicSiteProduct,
  TPublicSiteProductDimensions,
} from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi } from "../template.types";
import { cssUrl, formatSiteMoney } from "./site-format";
import styles from "./SiteProductModal.module.css";
import SiteThemeVars from "./SiteThemeVars";
import { addLabel } from "./useSiteContent";
import useSiteT from "./useSiteT";

interface Props {
  /** The product a visitor opened; none keeps the window closed. */
  product: IPublicSiteProduct | null;
  theme: IStoreSiteTheme;
  /** What the owner chose to show of a product: here, the price. */
  catalog?: Partial<IStoreSiteCatalog> | null;
  cart: ISiteCartApi;
  onClose: () => void;
}

// The unit each measure is kept in, as the product form asks for it.
const UNITS: Record<
  Exclude<keyof TPublicSiteProductDimensions, "size">,
  string
> = {
  height: "m",
  width: "m",
  length: "m",
  depth: "m",
  diameter: "m",
  thickness: "m",
  volume: "l",
  weight: "kg",
};

const NUMBER: Intl.NumberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 3,
});

/**
 * A product, opened: its pictures on one side, with a rail to pick among
 * them, and on the other what it is and what the store filled in about it
 * (details, brand, colors, measures), each in its own part. The button to
 * take it stays in sight however long the rest is. A click on the picture
 * shows it as large as the screen allows. The same for every template, in
 * the colors of the site.
 */
const SiteProductModal = ({
  product,
  theme,
  catalog,
  cart,
  onClose,
}: Props) => {
  const t = useSiteT();

  // The one being shown stays while the window closes, so it does not empty out.
  const [shown, setShown] = useState<IPublicSiteProduct | null>(product);

  // Which picture is on show: the main one comes first.
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  // The picture on show taking the whole screen, for a closer look.
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    setIsZoomed(false);

    if (product) {
      setShown(product);
      setPhotoIndex(0);
    }
  }, [product]);

  const view = siteCatalogOf(catalog);
  const isPriceShown: boolean = view.isPriceShown;

  const photos: string[] = shown
    ? Array.from(
        new Set(
          [shown.mainUrl, ...shown.filesUrl].filter(
            (fileKey: string | null): fileKey is string => !!fileKey,
          ),
        ),
      )
    : [];

  const measures: [string, string][] = shown?.dimensions
    ? (
        Object.entries(shown.dimensions) as [
          keyof TPublicSiteProductDimensions,
          string | number,
        ][]
      ).map(([key, value]): [string, string] => [
        t(`storeSite.product.dimensions.${key}`),
        key === "size"
          ? String(value)
          : `${NUMBER.format(Number(value))} ${UNITS[key]}`,
      ])
    : [];

  const colors: string[] = shown?.colors ?? [];

  const photoCount: number = photos.length;
  const photo: string | null = photos[photoIndex] ?? photos[0] ?? null;

  // Past the last picture comes the first, and the other way around.
  const step = useCallback(
    (by: number): void => {
      if (photoCount > 1) {
        setPhotoIndex(
          (current: number) => (current + by + photoCount) % photoCount,
        );
      }
    },
    [photoCount],
  );

  // The arrows of the keyboard go through the pictures while it is open, and
  // Escape leaves the large picture before it closes the window.
  useEffect(() => {
    if (!product) {
      return;
    }

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "ArrowLeft") {
        step(-1);
      } else if (event.key === "ArrowRight") {
        step(1);
      } else if (event.key === "Escape") {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [product, step]);

  return (
    <Modal
      open={!!product}
      footer={null}
      width={980}
      centered
      closable={false}
      keyboard={!isZoomed}
      className={styles.modal}
      onCancel={onClose}
    >
      {shown && (
        <SiteThemeVars theme={theme} className={styles.layout}>
          <button
            type="button"
            className={styles.close}
            aria-label={t("storeSite.product.close")}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div
            className={`${styles.gallery} ${
              photoCount > 1 ? "" : styles.galleryAlone
            }`}
          >
            {photoCount > 1 && (
              <div className={styles.thumbs}>
                {photos.map((fileKey: string, index: number) => (
                  <button
                    key={fileKey}
                    type="button"
                    className={`${styles.thumb} ${
                      index === photoIndex ? styles.thumbActive : ""
                    }`}
                    style={{ backgroundImage: cssUrl(fileKey) }}
                    aria-label={t("storeSite.product.photo", {
                      number: index + 1,
                    })}
                    aria-pressed={index === photoIndex}
                    onClick={() => setPhotoIndex(index)}
                  />
                ))}
              </div>
            )}

            <div className={styles.stage}>
              <div
                key={photo ?? "none"}
                className={styles.photo}
                style={{ backgroundImage: cssUrl(photo) }}
                role="img"
                aria-label={shown.name}
              />

              {photo && (
                <button
                  type="button"
                  className={styles.zoom}
                  aria-label={t("storeSite.product.zoom")}
                  title={t("storeSite.product.zoom")}
                  onClick={() => setIsZoomed(true)}
                >
                  <span className={styles.zoomHint} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
                    </svg>
                  </span>
                </button>
              )}

              {photoCount > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.arrow} ${styles.arrowPrevious}`}
                    aria-label={t("storeSite.product.previous")}
                    onClick={() => step(-1)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15 5l-7 7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.arrow} ${styles.arrowNext}`}
                    aria-label={t("storeSite.product.next")}
                    onClick={() => step(1)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className={styles.counter} aria-hidden="true">
                    {photoIndex + 1} / {photoCount}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.scroll}>
              <header className={styles.head}>
                {shown.brand && (
                  <div className={styles.brand}>{shown.brand}</div>
                )}
                <h2 className={styles.name}>{shown.name}</h2>

                {(isPriceShown || !shown.isAvailable) && (
                  <div className={styles.priceRow}>
                    {isPriceShown && (
                      <span className={styles.price}>
                        {formatSiteMoney(shown.price)}
                      </span>
                    )}
                    {!shown.isAvailable && (
                      <span className={styles.soldOut}>
                        {t("storeSite.public.unavailable")}
                      </span>
                    )}
                  </div>
                )}

                {shown.description && (
                  <p className={styles.text}>{shown.description}</p>
                )}
              </header>

              {shown.details && (
                <section className={styles.part}>
                  <h3 className={styles.label}>
                    {t("storeSite.product.details")}
                  </h3>
                  <p className={styles.text}>{shown.details}</p>
                </section>
              )}

              {colors.length > 0 && (
                <section className={styles.part}>
                  <h3 className={styles.label}>
                    {t("storeSite.product.colors")}
                  </h3>
                  <div className={styles.colors}>
                    {colors.map((color: string) => (
                      <span
                        key={color}
                        className={styles.color}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </section>
              )}

              {measures.length > 0 && (
                <section className={styles.part}>
                  <h3 className={styles.label}>
                    {t("storeSite.product.measures")}
                  </h3>
                  <dl className={styles.measures}>
                    {measures.map(([label, value]: [string, string]) => (
                      <div key={label} className={styles.measure}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>

            <footer className={styles.foot}>
              <button
 data-cart-add
                type="button"
                className={styles.add}
                disabled={!shown.isAvailable}
                onClick={() => {
                  cart.add(shown._id);
                  onClose();
                }}
              >
                {addLabel(shown, cart, t, view.addLabel)}
              </button>
            </footer>
          </div>
        </SiteThemeVars>
      )}

      {shown &&
        photo &&
        isZoomed &&
        createPortal(
          <SiteThemeVars theme={theme}>
            <div
              className={styles.lightbox}
              role="dialog"
              aria-modal="true"
              aria-label={shown.name}
              onClick={() => setIsZoomed(false)}
            >
              <div
                key={photo}
                className={styles.lightboxPhoto}
                style={{ backgroundImage: cssUrl(photo) }}
                role="img"
                aria-label={shown.name}
              />

              <button
                type="button"
                className={styles.lightboxClose}
                aria-label={t("storeSite.product.close")}
                onClick={() => setIsZoomed(false)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              {photoCount > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.lightboxArrow} ${styles.arrowPrevious}`}
                    aria-label={t("storeSite.product.previous")}
                    onClick={(event) => {
                      event.stopPropagation();
                      step(-1);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15 5l-7 7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.lightboxArrow} ${styles.arrowNext}`}
                    aria-label={t("storeSite.product.next")}
                    onClick={(event) => {
                      event.stopPropagation();
                      step(1);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className={styles.lightboxCounter} aria-hidden="true">
                    {photoIndex + 1} / {photoCount}
                  </span>
                </>
              )}
            </div>
          </SiteThemeVars>,
          document.body,
        )}
    </Modal>
  );
};

export default SiteProductModal;
