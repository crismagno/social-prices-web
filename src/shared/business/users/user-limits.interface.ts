export type FeatureKey =
  | "products"
  | "product-items"
  | "customers"
  | "employees"
  | "stores"
  | "categories"
  | "tags"
  | "quick-messages"
  | "site-mocks";

export const FEATURE_KEYS: FeatureKey[] = [
  "products",
  "product-items",
  "customers",
  "employees",
  "stores",
  "categories",
  "tags",
  "quick-messages",
  "site-mocks",
];

// Features that came after the limits: one a manager never set has this
// limit, not "unlimited". Mirrors the API (FeatureLimitsEnum.LimitedWhenUnset).
export const LIMITS_WHEN_UNSET: Partial<Record<FeatureKey, number>> = {
  "site-mocks": 2,
};

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
