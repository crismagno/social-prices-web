import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/handleClientError/handleClientError";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { IProduct } from "../../shared/business/products/products.interface";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../shared/utils/table/table-state.interface";

export const useFindProductsByUserTableState = (
  tableState?: ITableStateRequest<IProduct>
): {
  isLoading: boolean;
  products: IProduct[];
  total: number;
  fetchFindProductsByUserTableState: () => Promise<void>;
} => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFindProductsByUserTableState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: ITableStateResponse<IProduct[]> =
        await serviceMethodsInstance.productsServiceMethods.findByUserTableState(
          tableState
        );

      setProducts(response.data);
      setTotal(response.total);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchFindProductsByUserTableState();
  }, [fetchFindProductsByUserTableState]);

  return {
    isLoading,
    total,
    products,
    fetchFindProductsByUserTableState,
  };
};
