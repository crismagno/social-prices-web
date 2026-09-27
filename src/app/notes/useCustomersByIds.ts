import { useEffect, useRef, useState } from "react";

import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { ICustomer } from "../../shared/business/customers/customer.interface";

// There is no bulk "find customers by ids" endpoint, so names are resolved
// one by one and cached here as they are looked up. The grid, the filter bar
// and the view drawer all read from the same cache, so a customer only ever
// needs to be fetched once per page visit.
export const useCustomersByIds = (ids: string[]): Record<string, string> => {
  const cacheRef = useRef<Record<string, string>>({});

  const [, forceRender] = useState<number>(0);

  const idsKey: string = Array.from(new Set(ids)).sort().join(",");

  useEffect(() => {
    const missingIds: string[] = idsKey
      .split(",")
      .filter((id) => id && !(id in cacheRef.current));

    if (!missingIds.length) {
      return;
    }

    let isCancelled: boolean = false;

    (async () => {
      const results = await Promise.all(
        missingIds.map(async (id): Promise<[string, string]> => {
          try {
            const customer: ICustomer | null =
              await serviceMethodsInstance.customersServiceMethods.findById(id);

            return [id, customer?.name ?? id];
          } catch {
            return [id, id];
          }
        }),
      );

      if (isCancelled) {
        return;
      }

      for (const [id, name] of results) {
        cacheRef.current[id] = name;
      }

      forceRender((value) => value + 1);
    })();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return cacheRef.current;
};
