import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { IManager } from "../../../../shared/business/managers/manager.interface";

export type ManagerLoadError = "notFound" | "forbidden" | null;

export const useFindManagerById = (
  managerId: string | null
): {
  isLoading: boolean;
  manager: IManager | null;
  loadError: ManagerLoadError;
} => {
  const [manager, setManager] = useState<IManager | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Distinguishes why the fetch failed, since the two causes need different
  // messages: the id doesn't exist ("notFound") versus the server refused it
  // because the actor cannot manage that record ("forbidden", HTTP 403).
  // Everything else (a genuine 404, a network failure) is treated as "notFound".
  const [loadError, setLoadError] = useState<ManagerLoadError>(null);

  const fetchFindManagerById = useCallback(async () => {
    if (!managerId) {
      setManager(null);
      setLoadError(null);

      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const response: IManager =
        await serviceMethodsInstance.managersServiceMethods.findById(managerId);

      setManager(response);
    } catch (error: any) {
      setManager(null);
      setLoadError(error?.response?.status === 403 ? "forbidden" : "notFound");

      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchFindManagerById();
  }, [fetchFindManagerById]);

  return { isLoading, manager, loadError };
};
