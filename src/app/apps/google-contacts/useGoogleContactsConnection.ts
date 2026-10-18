"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IGoogleContactsConnection } from "../../../shared/business/apps/google-contacts/google-contacts.types";

// The connection as Google Contacts itself describes it (account, status, last
// import). Only asked while the app is enabled for the user: the API refuses
// the call otherwise.
export const useGoogleContactsConnection = (
  isEnabled: boolean,
): {
  connection: IGoogleContactsConnection | null;
  isLoadingConnection: boolean;
  refetchConnection: () => Promise<void>;
} => {
  const [connection, setConnection] =
    useState<IGoogleContactsConnection | null>(null);

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
        await serviceMethodsInstance.googleContactsServiceMethods.getConnection(),
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

  return { connection, isLoadingConnection, refetchConnection };
};
