"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { ITelegramConnection } from "../../../shared/business/apps/telegram/telegram.types";

// The bot as Telegram's own endpoint describes it. Only asked while the app is
// enabled for the user: the API refuses the call otherwise.
export const useTelegramConnection = (
  isEnabled: boolean,
): {
  connection: ITelegramConnection | null;
  isLoadingConnection: boolean;
  refetchConnection: () => Promise<void>;
  setConnection: (connection: ITelegramConnection | null) => void;
} => {
  const [connection, setConnection] = useState<ITelegramConnection | null>(
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
        await serviceMethodsInstance.telegramServiceMethods.getConnection(),
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
