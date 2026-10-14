import { useEffect, useMemo, useState } from "react";

import { App, Select } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { useFindProductsByUserTableState } from "../../../app/products/useFindProductsByUserTableState";
import { SelectProductItemModal } from "../../../app/sales/create/components/SelectProductItemModal/SelectProductItemModal";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IProductItem } from "../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../shared/business/products/products.interface";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { formatToMoneyDecimal } from "../../../shared/utils/strings/string";

export interface IFastSaleItem {
  storeId: string;
  productId: string;
  productItemId: string;
  name: string;
  barcode: string;
  sku: string | null;
  fileUrl: string | null;
  quantity: number;
  price: number;
}

interface Props {
  storeId: string | null;
  onAddItem: (item: IFastSaleItem) => void;
}

const SEARCH_DEBOUNCE_MS: number = 300;

export const FastSaleProductPicker: React.FC<Props> = ({
  storeId,
  onAddItem,
}) => {
  const { message } = App.useApp();
  const { t } = useLanguageData();

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [pendingProduct, setPendingProduct] = useState<IProduct | null>(null);
  const [pendingProductItems, setPendingProductItems] = useState<
    IProductItem[]
  >([]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
  }, [search]);

  // Memoized: the fetch hook refetches whenever this object's identity changes.
  const tableState = useMemo<ITableStateRequest<IProduct>>(
    () =>
      createTableState({
        search: debouncedSearch,
        filters: { isActive: [true], storeIds: storeId ? [storeId] : [] },
        sort: { field: "createdAt", order: "descend" },
        pagination: { current: undefined, pageSize: 10, skip: 0, total: 0 },
      }),
    [debouncedSearch, storeId],
  );

  const { products, isLoading } = useFindProductsByUserTableState(tableState);

  const addItem = (product: IProduct, productItem: IProductItem) => {
    onAddItem({
      storeId: storeId!,
      productId: product._id,
      productItemId: productItem._id,
      name: productItem.name,
      barcode: productItem.barcode ?? "",
      sku: productItem.sku ?? null,
      fileUrl: productItem.filesUrl?.[0] ?? product.filesUrl?.[0] ?? null,
      quantity: 1,
      price: productItem.price ?? product.price,
    });
  };

  const handleSelectProduct = async (productId: string) => {
    const product: IProduct | undefined = products.find(
      (p: IProduct) => p._id === productId,
    );

    if (!product || !storeId) {
      message.error(t("sales.productNotFound"));
      return;
    }

    try {
      const productItems: IProductItem[] =
        await serviceMethodsInstance.productItemsServiceMethods.findByProduct(
          productId,
        );

      const activeItems: IProductItem[] = productItems.filter(
        (item: IProductItem) => item.isActive,
      );

      if (!activeItems.length) {
        message.warning(t("sales.productHasNoActiveProductItems"));
        return;
      }

      if (activeItems.length === 1) {
        addItem(product, activeItems[0]);
        return;
      }

      setPendingProduct(product);
      setPendingProductItems(activeItems);
    } catch (error) {
      message.error(t("sales.errorLoadingProductItems"));
    }
  };

  const closePendingModal = () => {
    setPendingProduct(null);
    setPendingProductItems([]);
  };

  return (
    <>
      <Select
        showSearch
        value={undefined}
        filterOption={false}
        loading={isLoading}
        disabled={!storeId}
        onSearch={setSearch}
        onSelect={(productId) => {
          if (productId) handleSelectProduct(productId as string);
        }}
        placeholder={t("sales.fastSaleSearchProducts")}
        className="w-full"
        options={products.map((product: IProduct) => ({
          value: product._id,
          label: (
            <div className="flex justify-between">
              <span className="truncate">{product.name}</span>
              <span className="ml-2 text-gray-400">
                {formatToMoneyDecimal(product.price)}
              </span>
            </div>
          ),
        }))}
      />

      <SelectProductItemModal
        product={pendingProduct}
        productItems={pendingProductItems}
        isOpen={!!pendingProduct}
        onClose={closePendingModal}
        onSelectProductItem={(productItem: IProductItem) => {
          if (pendingProduct) {
            addItem(pendingProduct, productItem);
          }
          closePendingModal();
        }}
      />
    </>
  );
};
