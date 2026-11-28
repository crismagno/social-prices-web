import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  IPublicSiteProduct,
  TPublicSiteProductDimensions,
} from "../../../shared/business/store-sites/store-sites.types";

/** A measure of a product that is a number: every one but its size. */
export type TMeasureKey = Exclude<keyof TPublicSiteProductDimensions, "size">;

export type TRange = [number, number];

export type TProductSort = "DEFAULT" | "PRICE_UP" | "PRICE_DOWN" | "NAME";

export const PRODUCT_SORTS: TProductSort[] = [
  "DEFAULT",
  "PRICE_UP",
  "PRICE_DOWN",
  "NAME",
];

/** The unit each measure is kept in, as the product form asks for it. */
export const MEASURE_UNITS: Record<TMeasureKey, string> = {
  height: "m",
  width: "m",
  length: "m",
  depth: "m",
  diameter: "m",
  thickness: "m",
  volume: "l",
  weight: "kg",
};

const MEASURES: TMeasureKey[] = Object.keys(MEASURE_UNITS) as TMeasureKey[];

/** What the visitor asked for; an empty choice asks for nothing. */
export interface IProductFilterState {
  sort: TProductSort;
  price: TRange | null;
  isOnlyAvailable: boolean;
  brands: string[];
  colors: string[];
  sizes: string[];
  measures: Partial<Record<TMeasureKey, TRange>>;
  /** The years asked for: a product for any of them is one of the choices. */
  years: TRange | null;
}

/** What the products of the site have to choose among. */
export interface IProductFacets {
  /** The cheapest and the dearest; none when they all cost the same. */
  price: TRange | null;
  brands: string[];
  colors: string[];
  sizes: string[];
  /** The measures that differ between products, with their ends. */
  measures: Partial<Record<TMeasureKey, TRange>>;
  /** The first and the last year any product is for. */
  years: TRange | null;
  /** Whether any product cannot be bought now. */
  hasUnavailable: boolean;
}

export const EMPTY_PRODUCT_FILTER: IProductFilterState = {
  sort: "DEFAULT",
  price: null,
  isOnlyAvailable: false,
  brands: [],
  colors: [],
  sizes: [],
  measures: {},
  years: null,
};

// Each value once, in the order of the alphabet, blanks left out.
const distinct = (values: (string | null | undefined)[]): string[] =>
  Array.from(
    new Set(
      values
        .map((value: string | null | undefined) => value?.trim() ?? "")
        .filter(Boolean),
    ),
  ).sort((first: string, second: string) => first.localeCompare(second));

// The least and the most of some numbers; none when they do not differ.
const rangeOf = (values: number[]): TRange | null => {
  const numbers: number[] = values.filter((value: number) =>
    Number.isFinite(value),
  );

  if (numbers.length < 2) {
    return null;
  }

  const min: number = Math.min(...numbers);
  const max: number = Math.max(...numbers);

  return min < max ? [min, max] : null;
};

/**
 * What a product can be found by: itself as the site shows it, and each of
 * the items it is kept as. A product is one of the visitor's choices when any
 * of these is, alone, every choice at once.
 */
interface ICandidate {
  price: number;
  brand: string | null;
  colors: string[];
  dimensions: TPublicSiteProductDimensions | null;
  isAvailable: boolean;
}

const candidatesOf = (product: IPublicSiteProduct): ICandidate[] => [
  {
    price: product.price,
    brand: product.brand ?? null,
    colors: product.colors ?? [],
    dimensions: product.dimensions ?? null,
    isAvailable: product.isAvailable,
  },
  ...(product.variants ?? []),
];

/**
 * What there is to filter by, read from the products and from their items:
 * only what really differs among them.
 */
export const productFacetsOf = (
  products: IPublicSiteProduct[],
): IProductFacets => {
  const all: ICandidate[] = products.flatMap(candidatesOf);

  return {
    price: rangeOf(all.map((each: ICandidate) => each.price)),
    brands: distinct(all.map((each: ICandidate) => each.brand)),
    colors: distinct(all.flatMap((each: ICandidate) => each.colors)),
    sizes: distinct(all.map((each: ICandidate) => each.dimensions?.size)),
    measures: MEASURES.reduce(
      (kept: Partial<Record<TMeasureKey, TRange>>, key: TMeasureKey) => {
        const range: TRange | null = rangeOf(
          all
            .map((each: ICandidate) => each.dimensions?.[key])
            .filter((value): value is number => typeof value === "number"),
        );

        return range ? { ...kept, [key]: range } : kept;
      },
      {},
    ),
    years: rangeOf(
      products.flatMap((product: IPublicSiteProduct) =>
        [product.yearRange?.from, product.yearRange?.to].filter(
          (year): year is number => typeof year === "number",
        ),
      ),
    ),
    hasUnavailable: all.some((each: ICandidate) => !each.isAvailable),
  };
};

/**
 * Whether a product is for any of the years asked for. An end left open goes
 * on for ever that way; a product for no years in particular is for none.
 */
export const isForYears = (
  product: Pick<IPublicSiteProduct, "yearRange">,
  [first, last]: TRange,
): boolean => {
  const from: number | null = product.yearRange?.from ?? null;
  const to: number | null = product.yearRange?.to ?? null;

  if (from === null && to === null) {
    return false;
  }

  return (from ?? -Infinity) <= last && (to ?? Infinity) >= first;
};

const within = (value: number, [min, max]: TRange): boolean =>
  value >= min && value <= max;

/**
 * The products the visitor's choices leave, in the order asked for. A way of
 * filtering the owner turned off asks for nothing, whatever was chosen in it.
 */
export const filterProducts = (
  products: IPublicSiteProduct[],
  state: IProductFilterState,
  fields: Record<StoreSitesEnum.CatalogFilterField, boolean>,
): IPublicSiteProduct[] => {
  const Field = StoreSitesEnum.CatalogFilterField;

  const isChosen = (each: ICandidate): boolean => {
    if (
      fields[Field.PRICE] &&
      state.price &&
      !within(each.price, state.price)
    ) {
      return false;
    }

    if (
      fields[Field.AVAILABILITY] &&
      state.isOnlyAvailable &&
      !each.isAvailable
    ) {
      return false;
    }

    if (
      fields[Field.BRAND] &&
      state.brands.length > 0 &&
      !state.brands.includes(each.brand?.trim() ?? "")
    ) {
      return false;
    }

    if (
      fields[Field.COLOR] &&
      state.colors.length > 0 &&
      !each.colors.some((color: string) => state.colors.includes(color.trim()))
    ) {
      return false;
    }

    if (
      fields[Field.SIZE] &&
      state.sizes.length > 0 &&
      !state.sizes.includes(each.dimensions?.size?.trim() ?? "")
    ) {
      return false;
    }

    if (fields[Field.DIMENSIONS]) {
      for (const key of Object.keys(state.measures) as TMeasureKey[]) {
        const range: TRange | undefined = state.measures[key];
        const value: number | undefined = each.dimensions?.[key];

        // Without that measure, it is not within any range of it.
        if (range && (typeof value !== "number" || !within(value, range))) {
          return false;
        }
      }
    }

    return true;
  };

  const kept: IPublicSiteProduct[] = products.filter(
    (product: IPublicSiteProduct) =>
      (!fields[Field.YEAR] ||
        !state.years ||
        isForYears(product, state.years)) &&
      candidatesOf(product).some(isChosen),
  );

  if (!fields[Field.SORT] || state.sort === "DEFAULT") {
    return kept;
  }

  return [...kept].sort(
    (first: IPublicSiteProduct, second: IPublicSiteProduct) =>
      state.sort === "NAME"
        ? first.name.localeCompare(second.name)
        : state.sort === "PRICE_UP"
          ? first.price - second.price
          : second.price - first.price,
  );
};

/** How many of the visitor's choices are narrowing the products. */
export const activeFilterCount = (
  state: IProductFilterState,
  hasText: boolean,
): number =>
  [
    hasText,
    state.sort !== "DEFAULT",
    state.price !== null,
    state.isOnlyAvailable,
    state.brands.length > 0,
    state.colors.length > 0,
    state.sizes.length > 0,
    state.years !== null,
    ...Object.values(state.measures).map((range) => !!range),
  ].filter(Boolean).length;
