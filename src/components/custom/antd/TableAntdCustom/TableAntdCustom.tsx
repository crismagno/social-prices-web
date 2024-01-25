import { useState } from "react";

import { Col, Row, Table, TableProps } from "antd";
import Search, { SearchProps } from "antd/es/input/Search";

import { SearchOutlined } from "@ant-design/icons";

interface Props<T> extends TableProps<T> {
  search?: {
    placeholder?: string;
    onSearch?: (value: string) => void | Promise<void>;
    onSearchChange?: (e: any) => void | Promise<void>;
    value?: string;
  };
}

function TableAntdCustom<T extends object = any>({
  search,
  ...props
}: Props<T>) {
  const [searchValue, setSearchValue] = useState<string>(search?.value ?? "");

  const renderSearch = () => {
    if (!search) {
      return undefined;
    }

    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
      search.onSearch?.(value);
      setSearchValue(value);
    };

    const onSearchChange: SearchProps["onChange"] = (e) => {
      search.onSearchChange?.(e);
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

  return (
    <>
      {renderSearch()}
      <Table<T> {...props} />
    </>
  );
}

export default TableAntdCustom;
