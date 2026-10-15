"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/service-methods";
import { IAppCatalogItem } from "../../../../../shared/business/apps/apps.types";
import useAuthData from "../../../auth/useAuthData";

export interface IAppContextApps {
  catalog: IAppCatalogItem[];
  isLoadingApps: boolean;
  hasEnabledApps: boolean;
  fetchApps: () => Promise<void>;
}

export const useAppsDefaultValue: IAppContextApps = {
  catalog: [],
  isLoadingApps: false,
  hasEnabledApps: false,
  fetchApps: () => new Promise((resolve) => resolve()),
};

export const useApps = (): IAppContextApps => {
  const { isLogged } = useAuthData();

  const [catalog, setCatalog] = useState<IAppCatalogItem[]>([]);

  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(false);

  const fetchApps = useCallback(async () => {
    try {
      setIsLoadingApps(true);

      if (isLogged) {
        setCatalog(
          await serviceMethodsInstance.appsServiceMethods.findCatalog(),
        );
      } else {
        setCatalog([]);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingApps(false);
    }
  }, [isLogged]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return {
    catalog,
    isLoadingApps,
    hasEnabledApps: catalog.some((app: IAppCatalogItem) => app.enabled),
    fetchApps,
  };
};
