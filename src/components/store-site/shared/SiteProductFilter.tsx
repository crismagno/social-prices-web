"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ConfigProvider, Slider } from "antd";

import { IStoreSiteCatalogFilter } from "../../../shared/business/store-sites/store-site-catalog-filter";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { formatSiteMoney } from "./site-format";
import {
  EMPTY_PRODUCT_FILTER,
  IProductFacets,
  IProductFilterState,
  MEASURE_UNITS,
  PRODUCT_SORTS,
  TMeasureKey,
  TProductSort,
  TRange,
  activeFilterCount,
} from "./site-product-filter";
import styles from "./SiteProductFilter.module.css";
import useSiteT from "./useSiteT";

interface Props {
  settings: IStoreSiteCatalogFilter;
  facets: IProductFacets;
  state: IProductFilterState;
  onChange: (state: IProductFilterState) => void;
  /** The words searched for: the same the search box over the products has. */
  text: string;
  onTextChange: (text: string) => void;
  /** How many products the choices leave. */
  found: number;
  /** The site's main colour, for the sliders when the filter has none. */
  accent: string | undefined;
}

const Field = StoreSitesEnum.CatalogFilterField;

const NUMBER: Intl.NumberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 3,
});

// A step that gives a range some forty stops, whatever its size.
const stepOf = ([min, max]: TRange): number => {
  const rough: number = (max - min) / 40;

  return rough >= 1 ? Math.round(rough) : Number(rough.toPrecision(1)) || 0.01;
};

type TListKey = "brands" | "colors" | "sizes";

/**
 * The filter of the products: a tab on one side of the screen that opens a
 * floating panel, with every way of narrowing the products the owner left on
 * and the products have something to choose among. The products change as
 * the visitor chooses; nothing is sent anywhere.
 */
const SiteProductFilter = ({
  settings,
  facets,
  state,
  onChange,
  text,
  onTextChange,
  found,
  accent,
}: Props) => {
  const t = useSiteT();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // It floats over the whole page: drawn at the root of the site, so nothing
  // it sits inside can cut it or move with it.
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [root, setRoot] = useState<Element | null>(null);

  useEffect(() => {
    setRoot(anchorRef.current?.closest("[data-site-root]") ?? document.body);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const close = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [isOpen]);

  const { fields, colors } = settings;

  const set = (patch: Partial<IProductFilterState>): void =>
    onChange({ ...state, ...patch });

  const toggle = (list: TListKey, value: string): void =>
    set({
      [list]: state[list].includes(value)
        ? state[list].filter((each: string) => each !== value)
        : [...state[list], value],
    });

  const count: number = activeFilterCount(state, !!text.trim());

  const section = (title: string, body: ReactNode): ReactNode => (
    <section className={styles.section}>
      <h3 className={styles.heading}>{title}</h3>
      {body}
    </section>
  );

  const chips = (list: TListKey, values: string[]): ReactNode => (
    <div className={styles.chips}>
      {values.map((value: string) => (
        <button
          key={value}
          type="button"
          className={styles.chip}
          aria-pressed={state[list].includes(value)}
          onClick={() => toggle(list, value)}
        >
          {value}
        </button>
      ))}
    </div>
  );

  // A range with two handles, its ends written under it.
  const range = (
    ends: TRange,
    value: TRange | null | undefined,
    write: (value: number) => string,
    change: (value: TRange | null) => void,
  ): ReactNode => (
    <>
      <Slider
        range
        min={ends[0]}
        max={ends[1]}
        step={stepOf(ends)}
        value={value ?? ends}
        tooltip={{ formatter: (shown?: number) => write(shown ?? 0) }}
        onChange={(next: number[]) =>
          // Both handles at the ends ask for nothing.
          change(
            next[0] <= ends[0] && next[1] >= ends[1]
              ? null
              : [next[0], next[1]],
          )
        }
      />
      <div className={styles.ends}>
        <span>{write((value ?? ends)[0])}</span>
        <span>{write((value ?? ends)[1])}</span>
      </div>
    </>
  );

  const measureKeys: TMeasureKey[] = Object.keys(
    facets.measures,
  ) as TMeasureKey[];

  const panel: ReactNode = (
    <div
      className={styles.filter}
      data-side={settings.side}
      data-open={isOpen || undefined}
      style={
        {
          ...(colors.background ? { "--pf-bg": colors.background } : {}),
          ...(colors.text ? { "--pf-text": colors.text } : {}),
          ...(colors.accent ? { "--pf-accent": colors.accent } : {}),
        } as CSSProperties
      }
    >
      <button
        type="button"
        className={styles.tab}
        aria-expanded={isOpen}
        aria-label={t("storeSite.public.filter.open")}
        onClick={() => setIsOpen((open: boolean) => !open)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        <span className={styles.tabLabel}>
          {settings.title ?? t("storeSite.public.filter.title")}
        </span>
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </button>

      <aside
        className={styles.panel}
        aria-label={settings.title ?? t("storeSite.public.filter.title")}
        aria-hidden={!isOpen}
      >
        <header className={styles.top}>
          <strong>
            {settings.title ?? t("storeSite.public.filter.title")}
          </strong>
          <button
            type="button"
            className={styles.close}
            aria-label={t("storeSite.public.filter.close")}
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </header>

        <ConfigProvider
          theme={{
            token: { colorPrimary: colors.accent ?? accent ?? "#1677ff" },
          }}
        >
          <div className={styles.body}>
            {fields[Field.TEXT] &&
              section(
                t("storeSite.public.filter.text"),
                <input
                  type="text"
                  inputMode="search"
                  className={styles.input}
                  value={text}
                  placeholder={t("storeSite.public.searchProducts")}
                  onChange={(event) => onTextChange(event.target.value)}
                />,
              )}

            {fields[Field.SORT] &&
              section(
                t("storeSite.public.filter.sort"),
                <select
                  className={styles.input}
                  value={state.sort}
                  onChange={(event) =>
                    set({ sort: event.target.value as TProductSort })
                  }
                >
                  {PRODUCT_SORTS.map((sort: TProductSort) => (
                    <option key={sort} value={sort}>
                      {t(`storeSite.public.filter.sorts.${sort}`)}
                    </option>
                  ))}
                </select>,
              )}

            {fields[Field.PRICE] &&
              facets.price &&
              section(
                t("storeSite.public.filter.price"),
                range(facets.price, state.price, formatSiteMoney, (price) =>
                  set({ price }),
                ),
              )}

            {fields[Field.AVAILABILITY] && facets.hasUnavailable && (
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={state.isOnlyAvailable}
                  onChange={(event) =>
                    set({ isOnlyAvailable: event.target.checked })
                  }
                />
                <span>{t("storeSite.public.filter.onlyAvailable")}</span>
              </label>
            )}

            {fields[Field.BRAND] &&
              facets.brands.length > 1 &&
              section(
                t("storeSite.public.filter.brand"),
                chips("brands", facets.brands),
              )}

            {fields[Field.COLOR] &&
              facets.colors.length > 1 &&
              section(
                t("storeSite.public.filter.color"),
                <div className={styles.chips}>
                  {facets.colors.map((color: string) => (
                    <button
                      key={color}
                      type="button"
                      className={styles.swatch}
                      style={{ background: color }}
                      title={color}
                      aria-label={color}
                      aria-pressed={state.colors.includes(color)}
                      onClick={() => toggle("colors", color)}
                    />
                  ))}
                </div>,
              )}

            {fields[Field.SIZE] &&
              facets.sizes.length > 1 &&
              section(
                t("storeSite.public.filter.size"),
                chips("sizes", facets.sizes),
              )}

            {fields[Field.YEAR] &&
              facets.years &&
              section(
                t("storeSite.product.years"),
                range(facets.years, state.years, String, (years) =>
                  set({ years }),
                ),
              )}

            {fields[Field.DIMENSIONS] &&
              measureKeys.map((key: TMeasureKey) => (
                <section key={key} className={styles.section}>
                  <h3 className={styles.heading}>
                    {t(`storeSite.product.dimensions.${key}`)}
                  </h3>
                  {range(
                    facets.measures[key] as TRange,
                    state.measures[key],
                    (value: number) =>
                      `${NUMBER.format(value)} ${MEASURE_UNITS[key]}`,
                    (next: TRange | null) => {
                      const measures = { ...state.measures };

                      if (next) {
                        measures[key] = next;
                      } else {
                        delete measures[key];
                      }

                      set({ measures });
                    },
                  )}
                </section>
              ))}
          </div>
        </ConfigProvider>

        <footer className={styles.foot}>
          <span aria-live="polite">
            {t("storeSite.public.filter.found").replace(
              "{count}",
              String(found),
            )}
          </span>
          <button
            type="button"
            className={styles.clear}
            disabled={count === 0}
            onClick={() => {
              onChange(EMPTY_PRODUCT_FILTER);
              onTextChange("");
            }}
          >
            {t("storeSite.public.filter.clear")}
          </button>
        </footer>
      </aside>
    </div>
  );

  return (
    <>
      <span ref={anchorRef} hidden />
      {root && createPortal(panel, root)}
    </>
  );
};

export default SiteProductFilter;
