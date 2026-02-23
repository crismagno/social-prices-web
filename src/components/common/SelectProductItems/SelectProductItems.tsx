import React, { useState } from 'react';

import {
  Avatar,
  Select,
} from 'antd';
import {
  filter,
  includes,
} from 'lodash';

import {
  useFindProductItemsByUserTableState,
} from '../../../app/product-items/useFindProductItemsByUserTableState';
import useLanguageData from '../../../data/context/language/useLanguageData';
import {
  IProductItem,
} from '../../../shared/business/product-items/product-items.interface';
import { getImageUrl } from '../../../shared/utils/images/images-url';
import ImagesEnum from '../../../shared/utils/images/images.enum';
import { createTableState } from '../../../shared/utils/table/table-state';
import {
  ITableStateRequest,
} from '../../../shared/utils/table/table-state.interface';

const containerHeight: number = 260;

interface Props {
  onSelectProductItems?: (selectedProductItems: IProductItem[]) => void;
  selectedProductItemIds: string[];
  label?: any;
  labelClassName?: string;
  disabled?: boolean;
}

const SelectProductItems: React.FC<Props> = ({
  onSelectProductItems,
  selectedProductItemIds,
  label,
  labelClassName = "",
  disabled,
}) => {
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProductItem> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "descend" },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
      filters: selectedProductItemIds
        ? { productItemIds: selectedProductItemIds }
        : undefined,
    })
  );

  const { productItems } =
    useFindProductItemsByUserTableState(tableStateRequest);

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
          skip: productItems.length,
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
        value={selectedProductItemIds}
        onChange={(productItemIds: string[]) => {
          const selectedProductItems: IProductItem[] = filter(
            productItems,
            (productItem: IProductItem) =>
              includes(productItemIds, productItem._id)
          );
          onSelectProductItems?.(selectedProductItems);
        }}
        styles={{ popup: { root: { maxHeight: containerHeight } } }}
        allowClear
        listHeight={containerHeight}
        filterOption={false}
        style={{ width: "100%" }}
        disabled={disabled}
        placeholder={t("sales.selectProductItems")}
      >
        {productItems?.map((productItem: IProductItem) => (
          <Select.Option key={productItem._id} value={productItem._id}>
            <div className="flex items-center">
              <Avatar
                src={
                  productItem.mainUrl
                    ? getImageUrl(productItem.mainUrl)
                    : ImagesEnum.FilesNames.DefaultAvatarImage
                }
                size={"small"}
                className="mr-2"
              />
              <span>{productItem.name}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </>
  );
};

export default SelectProductItems;
