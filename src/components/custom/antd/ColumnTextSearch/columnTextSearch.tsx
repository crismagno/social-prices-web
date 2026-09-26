import { Button, Input, Space } from "antd";
import { ColumnType } from "antd/es/table";

import { SearchOutlined } from "@ant-design/icons";

// Text search in a column header. The typed text goes to the table state as
// `filters[<column key>] = [text]`, like any other Ant Design column filter.
export const getColumnTextSearchProps = <RecordType,>(
  t: (key: string) => string,
  placeholder: string,
): Pick<ColumnType<RecordType>, "filterDropdown" | "filterIcon"> => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div className="p-2" onKeyDown={(event) => event.stopPropagation()}>
      <Input
        autoFocus
        allowClear
        placeholder={placeholder}
        value={(selectedKeys[0] as string) ?? ""}
        onChange={(event) =>
          setSelectedKeys(event.target.value ? [event.target.value] : [])
        }
        onPressEnter={() => confirm()}
      />

      <Space className="mt-2">
        <Button
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => confirm()}
        >
          {t("common.search")}
        </Button>

        <Button
          size="small"
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
        >
          {t("common.reset")}
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
  ),
});
