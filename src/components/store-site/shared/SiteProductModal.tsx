"use client";

import { useEffect, useState } from "react";

import { Button, ConfigProvider, Modal } from "antd";

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
 * A product, opened: every picture, what it is, and what the store filled in
 * about it (details, brand, colors, measures). The same for every template.
 */
const SiteProductModal = ({ product, theme, cart, onClose }: Props) => {
  const t = useSiteT();

  // The one being shown stays while the window closes, so it does not empty out.
  const [shown, setShown] = useState<IPublicSiteProduct | null>(product);

  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setShown(product);
      setPhoto(product.mainUrl ?? product.filesUrl[0] ?? null);
    }
  }, [product]);

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

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: theme.primary, borderRadius: 10 } }}
    >
      <Modal
        open={!!product}
        footer={null}
        width={820}
        centered
        onCancel={onClose}
      >
        {shown && (
          <SiteThemeVars theme={theme}>
            <div className={styles.layout}>
              <div>
                <div
                  className={styles.photo}
                  style={{ backgroundImage: cssUrl(photo) }}
                  role="img"
                  aria-label={shown.name}
                />

                {photos.length > 1 && (
                  <div className={styles.thumbs}>
                    {photos.map((fileKey: string, index: number) => (
                      <button
                        key={fileKey}
                        type="button"
                        className={`${styles.thumb} ${
                          fileKey === photo ? styles.thumbActive : ""
                        }`}
                        style={{ backgroundImage: cssUrl(fileKey) }}
                        aria-label={t("storeSite.product.photo", {
                          number: index + 1,
                        })}
                        aria-pressed={fileKey === photo}
                        onClick={() => setPhoto(fileKey)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.info}>
                <div>
                  {shown.brand && (
                    <div className={styles.brand}>{shown.brand}</div>
                  )}
                  <h2 className={styles.name}>{shown.name}</h2>
                </div>

                <div className={styles.price}>
                  {formatSiteMoney(shown.price)}
                </div>

                {!shown.isAvailable && (
                  <div className={styles.soldOut}>
                    {t("storeSite.public.unavailable")}
                  </div>
                )}

                {shown.description && (
                  <p className={styles.text}>{shown.description}</p>
                )}

                {shown.details && (
                  <div>
                    <p className={styles.label}>
                      {t("storeSite.product.details")}
                    </p>
                    <p className={styles.text}>{shown.details}</p>
                  </div>
                )}

                {colors.length > 0 && (
                  <div>
                    <p className={styles.label}>
                      {t("storeSite.product.colors")}
                    </p>
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
                  </div>
                )}

                {measures.length > 0 && (
                  <div>
                    <p className={styles.label}>
                      {t("storeSite.product.measures")}
                    </p>
                    <dl className={styles.measures}>
                      {measures.map(([label, value]: [string, string]) => (
                        <div key={label} style={{ display: "contents" }}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  className={styles.add}
                  disabled={!shown.isAvailable}
                  onClick={() => {
                    cart.add(shown._id);
                    onClose();
                  }}
                >
                  {addLabel(shown, cart, t)}
                </Button>
              </div>
            </div>
          </SiteThemeVars>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default SiteProductModal;
