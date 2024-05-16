import { useState } from "react";

import { Button, Col, List, ListProps, Row } from "antd";
import Search, { SearchProps } from "antd/es/input/Search";
import VirtualList from "rc-virtual-list";

import { SearchOutlined } from "@ant-design/icons";

interface Props<T> extends ListProps<T> {
  search?: {
    placeholder?: string;
    onSearch?: (value: string) => void | Promise<void>;
    onSearchChange?: (e: any) => void | Promise<void>;
    value?: string;
  };
  isLoading?: boolean;
  data: any;
  containerHeight: number;
  handleScroll: () => void;
  itemKey: string;
  renderDataItem: (dataItem: any) => JSX.Element;
  total: number;
}

function ListCustomAntd<T extends object = any>({
  search,
  isLoading,
  data,
  containerHeight,
  handleScroll,
  itemKey,
  renderDataItem,
  total,
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

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          containerHeight
      ) <= 1
    ) {
      handleScroll();
    }
  };

  return (
    <>
      {renderSearch()}

      <List loading={isLoading} {...props}>
        <VirtualList
          data={data}
          height={containerHeight}
          itemHeight={50}
          itemKey={itemKey}
          onScroll={onScroll}
        >
          {(dataItem: any) => renderDataItem(dataItem)}
        </VirtualList>

        <div className="flex justify-between items-baseline mt-2">
          <div>
            Total: {data.length} / {total}
          </div>
          <Button onClick={handleScroll} loading={isLoading}>
            Load More
          </Button>

          <div></div>
        </div>
      </List>
    </>
  );
}

export default ListCustomAntd;
