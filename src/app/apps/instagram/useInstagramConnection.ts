"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IInstagramConnection } from "../../../shared/business/apps/instagram/instagram.types";

// The bot as Instagram's own endpoint describes it. Only asked while the app is
// enabled for the user: the API refuses the call otherwise.
export const useInstagramConnection = (
  isEnabled: boolean,
): {
  connection: IInstagramConnection | null;
  isLoadingConnection: boolean;
  refetchConnection: () => Promise<void>;
  setConnection: (connection: IInstagramConnection | null) => void;
} => {
  const [connection, setConnection] = useState<IInstagramConnection | null>(
    null,
  );

  const [isLoadingConnection, setIsLoadingConnection] =
    useState<boolean>(false);

  const refetchConnection = useCallback(async () => {
    if (!isEnabled) {
      setConnection(null);
      return;
    }

    try {
      setIsLoadingConnection(true);

      setConnection(
        await serviceMethodsInstance.instagramServiceMethods.getConnection(),
      );
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingConnection(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    refetchConnection();
  }, [refetchConnection]);

  return { connection, isLoadingConnection, refetchConnection, setConnection };
};
