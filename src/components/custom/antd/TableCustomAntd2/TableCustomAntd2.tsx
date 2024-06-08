import { Dispatch, SetStateAction, useState } from "react";

import { Col, Row, Table, TablePaginationConfig, TableProps } from "antd";
import Search, { SearchProps } from "antd/es/input/Search";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import { RecordType } from "zod";

import { SearchOutlined } from "@ant-design/icons";

import { ITableStateRequest } from "../../../../shared/utils/table/table-state.interface";

interface Props<T> extends TableProps<T> {
  search?: {
    placeholder?: string;
    value?: string;
  };
  setTableStateRequest: Dispatch<
    SetStateAction<ITableStateRequest<T> | undefined>
  >;
  tableStateRequest: ITableStateRequest<T> | undefined;
}

function TableCustomAntd2<T extends object = any>({
  search,
  setTableStateRequest,
  tableStateRequest,
  ...props
}: Props<T>) {
  const [searchValue, setSearchValue] = useState<string>(search?.value ?? "");

  const renderSearch = () => {
    if (!search) {
      return undefined;
    }

    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
      setTableStateRequest({ ...tableStateRequest, search: value?.trim() });
    };

    const onSearchChange: SearchProps["onChange"] = (e) => {
      setSearchValue(e.target.value);
    };

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Search
            style={{ margin: ".7rem 0px", width: "100%" }}
            placeholder={search.placeholder}
            allowClear
            enterButton={<SearchOutlined style={{ marginBottom: 5 }} />}
            size="middle"
            onSearch={onSearch}
            onChange={onSearchChange}
            value={searchValue}
          />
        </Col>
      </Row>
    );
  };

  const onChangeTable = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>
  ) => {
    setTableStateRequest({
      ...tableStateRequest,
      filters,
      pagination,
      sort: {
        field: sorter.field ?? "createdAt",
        order: sorter.order ?? "ascend",
      },
      action: extra.action,
    });
  };

  return (
    <>
      {renderSearch()}
      <Table<T> {...props} onChange={onChangeTable} />
    </>
  );
}

export default TableCustomAntd2;
