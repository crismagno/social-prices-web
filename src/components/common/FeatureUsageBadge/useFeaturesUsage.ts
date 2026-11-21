import { useCallback, useEffect, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  FeatureKey,
  IFeaturesUsage,
} from "../../../shared/business/users/user-limits.interface";
import handleClientError from "../HandleClientError/HandleClientError";

// `isEnabled` false skips the request: the usage belongs to company accounts,
// and the API refuses a customer account that asks for it.
export const useFeaturesUsage = (
  isEnabled: boolean = true
): {
  usage: IFeaturesUsage | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const [usage, setUsage] = useState<IFeaturesUsage | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refetch = useCallback(async () => {
    if (!isEnabled) {
      setUsage(null);

      return;
    }

    try {
      setIsLoading(true);

      setUsage(
        await serviceMethodsInstance.accountServiceMethods.getFeaturesUsage()
      );
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { usage, isLoading, refetch };
};

export const isFeatureLimitReached = (
  usage: IFeaturesUsage | null,
  feature: FeatureKey
): boolean => {
  const featureUsage = usage?.[feature];

  return (
    !!featureUsage &&
    featureUsage.limit !== null &&
    featureUsage.used >= featureUsage.limit
  );
};

// Only an explicit `false` from the API means the feature is switched off.
export const isFeatureDisabled = (
  usage: IFeaturesUsage | null,
  feature: FeatureKey
): boolean => usage?.[feature]?.enabled === false;

export const formatFeatureLimitReached = (
  t: (key: string) => string,
  feature: FeatureKey,
  usage: IFeaturesUsage | null
): string =>
  t("limits.reached")
    .replace("{limit}", String(usage?.[feature]?.limit ?? ""))
    .replace("{feature}", t(`limits.features.${feature}`));
