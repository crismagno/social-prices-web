"use client";

import { yearRangeLabel } from "../../../shared/business/products/products.interface";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import base from "./site-base.module.css";
import useSiteT from "./useSiteT";

interface Props {
  product: Pick<IPublicSiteProduct, "yearRange">;
  className?: string;
}

/**
 * The years a product is for, as a small label: "2015–2018". Nothing for a
 * product that is for no years in particular.
 */
const SiteProductYears = ({ product, className }: Props) => {
  const t = useSiteT();

  const label: string = yearRangeLabel(product.yearRange);

  if (!label) {
    return null;
  }

  return (
    // A line of its own, under the price: the label keeps the side the
    // template writes on (left, centre), whichever it is.
    <span className={base.productYearsRow}>
      <span
        className={className ?? base.productYears}
        title={t("storeSite.product.years")}
      >
        <span className={base.productYearsWord}>
          {t("storeSite.product.years")}
        </span>{" "}
        {label}
      </span>
    </span>
  );
};

export default SiteProductYears;
