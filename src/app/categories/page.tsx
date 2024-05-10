"use client";

import { useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { CategoryDetailDrawer } from "./components/CategoryDetailDrawer/CategoryDetailDrawer";
import { useFindCategoriesByUserTableState } from "./useFindCategoriesByUserTableState";

export default function CategoriesPage() {
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
        <TableCustomAntd2<ICategory>
          rowKey={"_id"}
          dataSource={categories}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
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
          search={{ placeholder: "Search categories.." }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
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
