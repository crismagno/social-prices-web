export type FeatureKey =
  | "products"
  | "product-items"
  | "customers"
  | "employees"
  | "stores"
  | "categories"
  | "tags"
  | "quick-messages";

export const FEATURE_KEYS: FeatureKey[] = [
  "products",
  "product-items",
  "customers",
  "employees",
  "stores",
  "categories",
  "tags",
  "quick-messages",
];

// The features a manager can switch off for an account.
export const TOGGLEABLE_FEATURE_KEYS: FeatureKey[] = ["quick-messages"];

export interface IUserLimits {
  features: Partial<Record<FeatureKey, number>>;
  enabled?: Partial<Record<FeatureKey, boolean>>;
}

export interface IFeatureUsage {
  limit: number | null;
  used: number;
  enabled?: boolean;
}

export type IFeaturesUsage = Record<FeatureKey, IFeatureUsage>;
