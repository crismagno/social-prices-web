import { useCallback, useEffect, useState } from "react";

import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IQuickMessageAvailable } from "../../shared/business/quick-messages/quick-messages.types";

// The quick messages the signed-in person may send, loaded once. A failure only
// hides the strip: the chat works without it.
export const useQuickMessages = (): {
  list: IQuickMessageAvailable[];
  reload: () => void;
} => {
  const [list, setList] = useState<IQuickMessageAvailable[]>([]);

  const reload = useCallback(() => {
    serviceMethodsInstance.quickMessagesServiceMethods
      .listAvailable()
      .then(setList)
      .catch((error: unknown) => {
        console.error(error);
        setList([]);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { list, reload };
};
