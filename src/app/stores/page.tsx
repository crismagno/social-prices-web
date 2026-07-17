"use client";

import { useState } from "react";

import { Button, Card, Space, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import {
  EditOutlined,
  EnterOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import { ImageOrDefault } from "../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { TagCategoriesCustomAntd } from "../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import { TagTagsCustomAntd } from "../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";
import StoresEnum from "../../shared/business/stores/stores.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import ImagesEnum from "../../shared/utils/images/images.enum";
import { sortArray } from "../../shared/utils/array/array-functions";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../categories/useFindCategoriesByType";
import { useFindTagsByType } from "../tags/useFindTagsByType";
import { useFindStoresByUserTableState } from "./useFindStoresByUserTableState";

export default function StoresPage() {
  const router: AppRouterInstance = useRouter();
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IStore> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, stores, total } =
    useFindStoresByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.STORE);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.STORE
  );

  const handleNewStore = () => {
    router.push(Urls.NEW_STORE);
  };

  const handleEditStore = (store: IStore) => {
    router.push(Urls.EDIT_STORE.replace(":storeId", store._id));
  };

  const handleGotToStore = (store: IStore) => {
    router.push(Urls.STORE.replace(":storeId", store._id));
  };

  if (isLoadingCategories || isLoadingTags) {
    return <LoadingFull />;
  }

  const categoriesSort: ICategory[] = sortArray(categories, "name");

  const tagsSort: ITag[] = sortArray(tags, "name");

  return (
    <Layout
      subtitle={t("stores.subtitle")}
      title={t("stores.title")}
      hasBackButton
    >
      <Card
        title={t("stores.title")}
        className="h-min-80 mt-5"
        extra={
          !stores.length && (
            <>
              <Button
                type="primary"
                onClick={handleNewStore}
                icon={<PlusOutlined />}
              >
                {t("stores.newStore")}
              </Button>
            </>
          )
        }
      >
        <TableCustomAntd2<IStore>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          dataSource={stores}
          columns={[
            {
              title: t("stores.logo"),
              dataIndex: "logo",
              key: "logo",
              align: "center",
              render: (logo: string) => (
                <ImageOrDefault
                  src={logo}
                  width={50}
                  defaultImage={ImagesEnum.FilesNames.DefaultStoreImage}
                />
              ),
            },
            {
              title: t("common.name"),
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: t("common.email"),
              dataIndex: "email",
              key: "email",
              align: "center",
            },
            {
              title: t("categories.title"),
              dataIndex: "categoriesIds",
              key: "categoriesIds",
              filters: categoriesSort.map((category: ICategory) => ({
                text: category.name,
                value: category._id,
              })),
              align: "center",
              render: (categoriesIds: string[]) => (
                <TagCategoriesCustomAntd
                  categories={categoriesSort}
                  categoriesIds={categoriesIds}
                />
              ),
            },
            {
              title: t("tags.title"),
              dataIndex: "tagsIds",
              key: "tagsIds",
              filters: tagsSort.map((tag: ITag) => ({
                text: tag.name,
                value: tag._id,
              })),
              align: "center",
              render: (tagsIds: string[]) => (
                <TagTagsCustomAntd tags={tagsSort} tagsIds={tagsIds} />
              ),
            },
            {
              title: t("common.status"),
              dataIndex: "status",
              filters: Object.keys(StoresEnum.Status).map((status: string) => ({
                text: t(StoresEnum.StatusLabel[status as StoresEnum.Status]),
                value: status,
              })),
              key: "status",
              align: "center",
              render: (status: StoresEnum.Status) => (
                <Tag color={StoresEnum.StatusColor[status]}>
                  {t(StoresEnum.StatusLabel[status])}
                </Tag>
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
              render: (_: any, store: IStore) => {
                return (
                  <Space.Compact>
                    <Tooltip title={t("stores.editStore")}>
                      <Button
                        type="success"
                        onClick={() => handleEditStore(store)}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title={t("stores.goToStore")}>
                      <Button
                        type="default"
                        onClick={() => handleGotToStore(store)}
                        icon={<EnterOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title={t("stores.createSale")}>
                      <Button
                        type="primary"
                        onClick={() =>
                          router.push(
                            Urls.SALES_CREATE_BY_STORE.replace(
                              ":storeId",
                              store._id
                            )
                          )
                        }
                        icon={<ShoppingCartOutlined />}
                      />
                    </Tooltip>
                  </Space.Compact>
                );
              },
            },
          ]}
          search={{ placeholder: t("stores.searchStores") }}
          loading={isLoading}
          total={total}
        />
      </Card>
    </Layout>
  );
}
