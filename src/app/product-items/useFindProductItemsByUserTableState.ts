import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IProductItem } from "../../shared/business/product-items/product-items.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindProductItemsByUserTableState = (
  tableState?: ITableStateRequest<IProductItem>
): {
  isLoading: boolean;
  productItems: IProductItem[];
  total: number;
  fetchFindProductItemsByUserTableState: () => Promise<void>;
} => {
  const [productItems, setProductItems] = useState<IProductItem[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindProductItemsByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);

      const response: ITableStateResponse<IProductItem[]> =
        await serviceMethodsInstance.productItemsServiceMethods.findByUserTableState(
          tableState
        );

      if (tableState?.useConcat) {
        setProductItems((value) => [...value, ...response.data]);
      } else {
        setProductItems(response.data);
      }

      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindProductItemsByUserTableState();
  }, [fetchFindProductItemsByUserTableState]);

  return {
    isLoading,
    total,
    productItems,
    fetchFindProductItemsByUserTableState,
  };
};
