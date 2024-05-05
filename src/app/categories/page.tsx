"use client";

import { useState } from "react";

import { Button, Card, TablePaginationConfig, Tag, Tooltip } from "antd";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";
import { RecordType } from "zod";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import TableCustomAntd from "../../components/custom/antd/TableCustomAntd/TableCustomAntd";
import Layout from "../../components/template/Layout/Layout";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { CategoryDetailDrawer } from "./components/CategoryDetailDrawer/CategoryDetailDrawer";
import { useFindCategoriesByUserTableState } from "./useFindCategoriesByUserTableState";

export default function CategoriesPage() {
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICategory> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, categories, total, fetchFindCategoriesByUserTableState } =
    useFindCategoriesByUserTableState(tableStateRequest);

  const [isCategoryDetailDrawerOpen, setIsCategoryDetailDrawerOpen] =
    useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const handleNewCategory = () => {
    setCategoryId(undefined);
    setIsCategoryDetailDrawerOpen(true);
  };

  const handleEditCategory = (category: ICategory) => {
    setCategoryId(category._id);
    setIsCategoryDetailDrawerOpen(true);
  };

  const onSearch = (value: string) => {
    setTableStateRequest({ ...tableStateRequest, search: value?.trim() });
  };

  const handleChangeTable = (
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
    <Layout subtitle="My Categories" title="Categories" hasBackButton>
      <Card
        title="Categories"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={handleNewCategory}
              icon={<PlusOutlined />}
            >
              New Category
            </Button>
          </>
        }
      >
        <TableCustomAntd<ICategory>
          rowKey={"_id"}
          onChange={handleChangeTable}
          dataSource={categories}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
              align: "center",
              filters: Object.keys(CategoriesEnum.Type).map((type: string) => ({
                text: CategoriesEnum.TypeLabels[type as CategoriesEnum.Type],
                value: type,
              })),
              render: (type: CategoriesEnum.Type) => (
                <Tag>{CategoriesEnum.TypeLabels[type]}</Tag>
              ),
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, category: ICategory) => {
                return (
                  <>
                    <Tooltip title="Edit category">
                      <Button
                        className="mr-1"
                        type="success"
                        onClick={() => handleEditCategory(category)}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                  </>
                );
              },
            },
          ]}
          search={{ onSearch, placeholder: "Search categories.." }}
          loading={isLoading}
          pagination={{
            total,
          }}
        />
        <CategoryDetailDrawer
          isOpen={isCategoryDetailDrawerOpen}
          categoryId={categoryId}
          onClose={() => {
            setCategoryId(undefined);
            setIsCategoryDetailDrawerOpen(false);
          }}
          onOk={() => {
            setCategoryId(undefined);
            setIsCategoryDetailDrawerOpen(false);
            fetchFindCategoriesByUserTableState();
          }}
        />
      </Card>
    </Layout>
  );
}
