import { useCallback, useEffect, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  FeatureKey,
  IFeaturesUsage,
} from "../../../shared/business/users/user-limits.interface";
import handleClientError from "../HandleClientError/HandleClientError";

export const useFeaturesUsage = (): {
  usage: IFeaturesUsage | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const [usage, setUsage] = useState<IFeaturesUsage | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refetch = useCallback(async () => {
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
  }, []);

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
