import React, { useState } from 'react';

import {
  Avatar,
  Select,
} from 'antd';
import { find } from 'lodash';

import {
  useFindProductsByUserTableState,
} from '../../../app/products/useFindProductsByUserTableState';
import { IProduct } from '../../../shared/business/products/products.interface';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import { createTableState } from '../../../shared/utils/table/table-state';
import {
  ITableStateRequest,
} from '../../../shared/utils/table/table-state.interface';

const containerHeight: number = 260;

interface Props {
  onSelectProduct?: (selectedProduct: IProduct | null) => void;
  selectedProductId?: string;
  label?: any;
  labelClassName?: string;
  disabled?: boolean;
}

const SelectProduct: React.FC<Props> = ({
  onSelectProduct,
  selectedProductId,
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
      filters: selectedProductId
        ? { productIds: [selectedProductId] }
        : undefined,
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
        value={selectedProductId}
        onChange={(productId: string) => {
          const selectedProduct: IProduct | null =
            find(products, {
              _id: productId,
            }) ?? null;
          onSelectProduct?.(selectedProduct || null);
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
                    : ImagesEnum.FilesNames.DefaultAvatarImage
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

export default SelectProduct;
