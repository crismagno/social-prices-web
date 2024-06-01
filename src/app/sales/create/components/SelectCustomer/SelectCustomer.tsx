import React, { useState } from "react";

import { Avatar, Select } from "antd";

import { ICustomer } from "../../../../../shared/business/customers/customer.interface";
import { defaultAvatarImage } from "../../../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../../../shared/utils/images/url-images";
import { createTableState } from "../../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../../shared/utils/table/table-state.interface";
import { useFindCustomersByOwnerOfUserTableState } from "../../../../customers/useFindCustomersByOwnerOfUserTableState";

const containerHeight: number = 260;

interface Props {
  onSelectCustomer?: (customer: ICustomer | null) => void;
}

export const SelectCustomer: React.FC<Props> = ({ onSelectCustomer }) => {
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "descend" },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    })
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
              (customer: ICustomer) => customer._id === (customerId as any)
            )
          : null;

        onSelectCustomer?.(selectedCustomer ?? null);
      }}
      defaultValue={null}
      dropdownStyle={{
        maxHeight: containerHeight,
      }}
      listHeight={containerHeight}
      filterOption={false}
      style={{ width: 250 }}
    >
      <Select.Option key={"NEW_CUSTOMER"} value={null}>
        <div className="flex items-center">
          <Avatar src={defaultAvatarImage} size={"small"} className="mr-2" />
          <span>New Customer</span>
        </div>
      </Select.Option>

      {customers?.map((customer: ICustomer) => (
        <Select.Option key={customer._id} value={customer._id}>
          <div className="flex items-center">
            <Avatar
              src={
                customer.avatar
                  ? getImageUrl(customer.avatar)
                  : defaultAvatarImage
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
