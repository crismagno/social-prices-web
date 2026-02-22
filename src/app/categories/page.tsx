"use client";

import { useState } from 'react';

import {
  Button,
  Card,
  Tag,
  Tooltip,
} from 'antd';
import moment from 'moment';

import {
  BlockOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import TableCustomAntd2
  from '../../components/custom/antd/TableCustomAntd2/TableCustomAntd2';
import Layout from '../../components/template/Layout/Layout';
import useLanguageData from '../../data/context/language/useLanguageData';
import CategoriesEnum from '../../shared/business/categories/categories.enum';
import {
  ICategory,
} from '../../shared/business/categories/categories.interface';
import TagsEnum from '../../shared/business/tags/tags.enum';
import DatesEnum from '../../shared/utils/dates/dates.enum';
import { createTableState } from '../../shared/utils/table/table-state';
import {
  ITableStateRequest,
} from '../../shared/utils/table/table-state.interface';
import {
  CategoryDetailDrawer,
} from './components/CategoryDetailDrawer/CategoryDetailDrawer';
import {
  useFindCategoriesByUserTableState,
} from './useFindCategoriesByUserTableState';

export default function CategoriesPage() {
  const { t } = useLanguageData()!;

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICategory> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, categories, total, fetchFindCategoriesByUserTableState } =
    useFindCategoriesByUserTableState(tableStateRequest);

  const [isCategoryDetailDrawerOpen, setIsCategoryDetailDrawerOpen] =
    useState<boolean>(false);

  const [categoryId, setCategoryId] = useState<string | undefined>();

  return (
    <Layout
      subtitle={t("categories.myCategories")}
      title={t("categories.title")}
      hasBackButton
    >
      <Card
        title={t("categories.title")}
        className="h-min-80 mt-5"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setCategoryId(undefined);
              setIsCategoryDetailDrawerOpen(true);
            }}
            icon={<PlusOutlined />}
          >
            {t("categories.newCategory")}
          </Button>
        }
      >
        <TableCustomAntd2<ICategory>
          rowKey={"_id"}
          dataSource={categories}
          columns={[
            {
              title: t("common.name"),
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: t("categories.color"),
              dataIndex: "color",
              key: "color",
              align: "center",
              render: (color: string | null) => (
                <BlockOutlined
                  style={{
                    color: color ?? TagsEnum.defaultTagColor,
                    fontSize: TagsEnum.defaultTagSize,
                  }}
                />
              ),
            },
            {
              title: t("common.description"),
              dataIndex: "description",
              key: "description",
              align: "center",
            },
            {
              title: t("categories.type"),
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
              title: t("profile.createdAt"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("profile.updatedAt"),
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: t("common.actions"),
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, category: ICategory) => (
                <Tooltip title={t("categories.editCategory")}>
                  <Button
                    className="mr-1"
                    type="success"
                    onClick={() => {
                      setCategoryId(category._id);
                      setIsCategoryDetailDrawerOpen(true);
                    }}
                    icon={<EditOutlined />}
                  />
                </Tooltip>
              ),
            },
          ]}
          search={{ placeholder: t("categories.searchCategories") }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
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
