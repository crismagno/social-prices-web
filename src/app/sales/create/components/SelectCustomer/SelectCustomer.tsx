import React, { useState } from "react";

import { Select } from "antd";

import { ICustomer } from "../../../../../shared/business/customers/customer.interface";
import { createTableState } from "../../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../../shared/utils/table/table-state.interface";
import { useFindCustomersByOwnerOfUserTableState } from "../../../../customers/useFindCustomersByOwnerOfUserTableState";

const containerHeight: number = 250;

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
      style={{ width: 300 }}
    >
      <Select.Option key={"NEW_CUSTOMER"} value={null}>
        New Customer
      </Select.Option>

      {customers?.map((customer: ICustomer) => (
        <Select.Option key={customer._id} value={customer._id}>
          {customer.name}
        </Select.Option>
      ))}
    </Select>
  );
};
