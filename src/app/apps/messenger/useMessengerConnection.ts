"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IMessengerConnection } from "../../../shared/business/apps/messenger/messenger.types";

// The bot as Messenger's own endpoint describes it. Only asked while the app is
// enabled for the user: the API refuses the call otherwise.
export const useMessengerConnection = (
  isEnabled: boolean,
): {
  connection: IMessengerConnection | null;
  isLoadingConnection: boolean;
  refetchConnection: () => Promise<void>;
  setConnection: (connection: IMessengerConnection | null) => void;
} => {
  const [connection, setConnection] = useState<IMessengerConnection | null>(
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
        await serviceMethodsInstance.messengerServiceMethods.getConnection(),
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
