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
  // `silent` refreshes without the loading state: used by the periodic refresh.
  fetchApps: (silent?: boolean) => Promise<void>;
}

export const useAppsDefaultValue: IAppContextApps = {
  catalog: [],
  isLoadingApps: false,
  hasEnabledApps: false,
  fetchApps: () => new Promise((resolve) => resolve()),
};

// How often the unread counts are refreshed while the page is open and visible.
const POLL_MS: number = 20000;

export const useApps = (): IAppContextApps => {
  const { isLogged } = useAuthData();

  const [catalog, setCatalog] = useState<IAppCatalogItem[]>([]);

  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(false);

  const fetchApps = useCallback(
    async (silent: boolean = false) => {
      try {
        if (!silent) {
          setIsLoadingApps(true);
        }

        if (isLogged) {
          setCatalog(
            await serviceMethodsInstance.appsServiceMethods.findCatalog(),
          );
        } else {
          setCatalog([]);
        }
      } catch (error: any) {
        // A refresh in the background stays quiet: only the first load complains.
        if (!silent) {
          handleClientError(error);
        }
      } finally {
        if (!silent) {
          setIsLoadingApps(false);
        }
      }
    },
    [isLogged],
  );

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const hasEnabledApps: boolean = catalog.some(
    (app: IAppCatalogItem) => app.enabled,
  );

  // New messages arrive while the user is elsewhere: the counts are refreshed
  // every few seconds, only while something is enabled and the tab is visible.
  useEffect(() => {
    if (!isLogged || !hasEnabledApps) {
      return;
    }

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchApps(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [isLogged, hasEnabledApps, fetchApps]);

  return {
    catalog,
    isLoadingApps,
    hasEnabledApps,
    fetchApps,
  };
};
