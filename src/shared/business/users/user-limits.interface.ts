export type FeatureKey =
  | "products"
  | "product-items"
  | "customers"
  | "employees"
  | "stores"
  | "categories"
  | "tags";

export const FEATURE_KEYS: FeatureKey[] = [
  "products",
  "product-items",
  "customers",
  "employees",
  "stores",
  "categories",
  "tags",
];

export interface IUserLimits {
  features: Partial<Record<FeatureKey, number>>;
}

export interface IFeatureUsage {
  limit: number | null;
  used: number;
}

export type IFeaturesUsage = Record<FeatureKey, IFeatureUsage>;
