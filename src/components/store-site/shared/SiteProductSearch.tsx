"use client";

import styles from "./SiteProductSearch.module.css";
import useSiteT from "./useSiteT";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/** The search box over the products, in the colors of the site. */
const SiteProductSearch = ({ value, onChange }: Props) => {
  const t = useSiteT();

  return (
    <div className={styles.search} role="search">
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        className={styles.input}
        value={value}
        placeholder={t("storeSite.public.searchProducts")}
        aria-label={t("storeSite.public.searchProducts")}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t("storeSite.public.clearSearch")}
          onClick={() => onChange("")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SiteProductSearch;
