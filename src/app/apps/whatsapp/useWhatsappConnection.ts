"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IWhatsappConnection } from "../../../shared/business/apps/whatsapp/whatsapp.types";

// The number as WhatsApp's endpoint describes it. Only asked while the app is
// enabled for the user: the API refuses the call otherwise.
export const useWhatsappConnection = (
  isEnabled: boolean,
): {
  connection: IWhatsappConnection | null;
  isLoadingConnection: boolean;
  setConnection: (connection: IWhatsappConnection | null) => void;
} => {
  const [connection, setConnection] = useState<IWhatsappConnection | null>(
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
        await serviceMethodsInstance.whatsappServiceMethods.getConnection(),
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

  return { connection, isLoadingConnection, setConnection };
};
