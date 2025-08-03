import React, { useState } from "react";

import { Avatar, Select } from "antd";
import { filter, includes } from "lodash";

import { useFindProductsByUserTableState } from "../../../app/products/useFindProductsByUserTableState";
import { IProduct } from "../../../shared/business/products/products.interface";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../shared/utils/images/url-images";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";

const containerHeight: number = 260;

interface Props {
  onSelectProducts?: (selectedProducts: IProduct[]) => void;
  selectedProductIds: string[];
  label?: any;
  labelClassName?: string;
  disabled?: boolean;
}

const SelectProducts: React.FC<Props> = ({
  onSelectProducts,
  selectedProductIds,
  label,
  labelClassName = "",
  disabled,
}) => {
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "descend" },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    })
  );

  const { products } = useFindProductsByUserTableState(tableStateRequest);

  const onSearch = (value: string) => {
    setTableStateRequest({
      ...tableStateRequest,
      search: value?.trim(),
      pagination: {
        total: 0,
        current: undefined,
        pageSize: 10,
        skip: 0,
      },
      useConcat: false,
    });
  };

  const onPopupScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight -
        e.currentTarget.scrollTop -
        containerHeight <=
      1
    ) {
      setTableStateRequest({
        ...tableStateRequest,
        filters: {},
        pagination: {
          total: 0,
          current: undefined,
          pageSize: 10,
          skip: products.length,
        },
        useConcat: true,
      });
    }
  };

  return (
    <>
      {label && (
        <label className={`mr-1 font-bold ${labelClassName}`}>{label}</label>
      )}
      <Select
        onPopupScroll={onPopupScroll}
        onSearch={onSearch}
        showSearch
        mode="multiple"
        value={selectedProductIds}
        onChange={(productIds: string[]) => {
          const selectedProducts: IProduct[] = filter(
            products,
            (product: IProduct) => includes(productIds, product._id)
          );
          onSelectProducts?.(selectedProducts);
        }}
        dropdownStyle={{
          maxHeight: containerHeight,
        }}
        allowClear
        listHeight={containerHeight}
        filterOption={false}
        style={{ width: "100%" }}
        disabled={disabled}
      >
        {products?.map((product: IProduct) => (
          <Select.Option key={product._id} value={product._id}>
            <div className="flex items-center">
              <Avatar
                src={
                  product.mainUrl
                    ? getImageUrl(product.mainUrl)
                    : defaultAvatarImage
                }
                size={"small"}
                className="mr-2"
              />
              <span>{product.name}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </>
  );
};

export default SelectProducts;
