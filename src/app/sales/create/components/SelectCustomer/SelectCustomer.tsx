import React, { useState } from "react";

import { Avatar, Select } from "antd";

import useLanguageData from "../../../../../data/context/language/useLanguageData";
import { ICustomer } from "../../../../../shared/business/customers/customer.interface";
import { getImageUrl } from "../../../../../shared/utils/images/images-url";
import ImagesEnum from "../../../../../shared/utils/images/images.enum";
import { createTableState } from "../../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../../shared/utils/table/table-state.interface";
import { useFindCustomersByOwnerOfUserTableState } from "../../../../customers/useFindCustomersByOwnerOfUserTableState";

const containerHeight: number = 260;

interface Props {
  onSelectCustomer?: (customer: ICustomer | null) => void;
  showNewCustomerOption?: boolean;
  selectProps?: {
    className?: string;
  };
  style?: any;
}

export const SelectCustomer: React.FC<Props> = ({
  onSelectCustomer,
  showNewCustomerOption = true,
  selectProps,
  style,
}) => {
  const { t } = useLanguageData();
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "descend" },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    }),
  );

  const { customers } =
    useFindCustomersByOwnerOfUserTableState(tableStateRequest);

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
          skip: customers.length,
        },
        useConcat: true,
      });
    }
  };

  return (
    <Select
      onPopupScroll={onPopupScroll}
      onSearch={onSearch}
      showSearch
      onSelect={(customerId) => {
        const selectedCustomer: ICustomer | undefined | null = customerId
          ? customers.find(
              (customer: ICustomer) => customer._id === (customerId as any),
            )
          : null;

        onSelectCustomer?.(selectedCustomer ?? null);
      }}
      defaultValue={null}
      styles={{ popup: { root: { maxHeight: containerHeight } } }}
      listHeight={containerHeight}
      filterOption={false}
      placeholder={t("sales.selectCustomer")}
      style={style ?? { width: 250 }}
      className={selectProps?.className}
    >
      {showNewCustomerOption && (
        <Select.Option key={"NEW_CUSTOMER"} value={null}>
          <div className="flex items-center">
            <Avatar
              src={ImagesEnum.FilesNames.DefaultAvatarImage}
              size={"small"}
              className="mr-2"
            />
            <span>{t("sales.newCustomer")}</span>
          </div>
        </Select.Option>
      )}

      {customers?.map((customer: ICustomer) => (
        <Select.Option key={customer._id} value={customer._id}>
          <div className="flex items-center">
            <Avatar
              src={
                customer.avatar
                  ? getImageUrl(customer.avatar)
                  : ImagesEnum.FilesNames.DefaultAvatarImage
              }
              size={"small"}
              className="mr-2"
            />
            <span>{customer.name}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
