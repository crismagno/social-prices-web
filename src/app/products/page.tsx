"use client";

import { useState } from "react";

import { Avatar, Badge, Button, Card, Image, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { TagCategoriesCustomAntd } from "../../components/common/TagCategoriesCustomAntd/TagCategoriesCustomAntd";
import YesNo from "../../components/common/YesNo/YesNo";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import CategoriesEnum from "../../shared/business/categories/categories.enum";
import { ICategory } from "../../shared/business/categories/categories.interface";
import { IProduct } from "../../shared/business/products/products.interface";
import StoresEnum from "../../shared/business/stores/stores.enum";
import { IStore } from "../../shared/business/stores/stores.interface";
import CommonEnum from "../../shared/common/enums/common.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import { sortArray } from "../../shared/utils/array/functions";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageUrl } from "../../shared/utils/images/url-images";
import { formatterMoney } from "../../shared/utils/string-extensions/string-extensions";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindCategoriesByType } from "../categories/useFindCategoriesByType";
import { useFindStoresByUser } from "../stores/useFindStoresByUser";
import { useFindProductsByUserTableState } from "./useFindProductsByUserTableState";

export default function ProductsPage() {
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, products, total } =
    useFindProductsByUserTableState(tableStateRequest);

  const { categories, isLoading: isLoadingCategories } =
    useFindCategoriesByType(CategoriesEnum.Type.PRODUCT);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const handleNewProduct = () => {
    router.push(Urls.NEW_PRODUCT);
  };

  const handleEditProduct = (product: IProduct) => {
    router.push(Urls.EDIT_PRODUCT.replace(":productId", product._id));
  };

  if (isLoadingStores || isLoadingCategories) {
    return <LoadingFull />;
  }

  const getStore = (storeId: string): IStore | undefined =>
    stores.find((store) => store._id === storeId);

  const categoriesSort: ICategory[] = sortArray(categories, "name");

  return (
    <Layout subtitle="My Products" title="Products" hasBackButton>
      <Card
        title="Products"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={handleNewProduct}
              icon={<PlusOutlined />}
            >
              New Product
            </Button>
          </>
        }
      >
        <TableCustomAntd2<IProduct>
          rowKey={"_id"}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          dataSource={products}
          columns={[
            {
              title: "#",
              dataIndex: "filesUrl",
              key: "filesUrl",
              align: "center",
              render: (filesUrl: string[]) => {
                if (!filesUrl?.length) {
                  return (
                    <Image
                      width={50}
                      height={50}
                      src={defaultAvatarImage}
                      alt="mainUrl"
                      className="rounded-full"
                    />
                  );
                }

                return (
                  <Avatar.Group
                    maxCount={2}
                    shape="circle"
                    size="large"
                    maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
                  >
                    {filesUrl.map((fileUrl) => (
                      <Image
                        key={fileUrl}
                        width={40}
                        src={getImageUrl(fileUrl)}
                        alt="mainUrl"
                        className="rounded-full"
                      />
                    ))}
                  </Avatar.Group>
                );
              },
            },
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              align: "center",
            },
            {
              title: "BarCode",
              dataIndex: "barCode",
              key: "barCode",
              align: "center",
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
              key: "quantity",
              align: "center",
            },
            {
              title: "Price",
              dataIndex: "price",
              key: "price",
              align: "center",
              render: (price: number) => formatterMoney(price),
            },
            {
              title: "Categories",
              dataIndex: "categoriesIds",
              key: "categoriesIds",
              align: "center",
              filters: categoriesSort.map((category: ICategory) => ({
                text: category.name,
                value: category._id,
              })),
              render: (categoriesIds: string[]) => (
                <TagCategoriesCustomAntd
                  categories={categoriesSort}
                  categoriesIds={categoriesIds}
                />
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
              title: "Active",
              dataIndex: "isActive",
              key: "isActive",
              align: "center",
              filters: Object.keys(CommonEnum.YesNo).map((value) => ({
                value: value === CommonEnum.YesNo.YES,
                text: CommonEnum.YesNoLabels[value as CommonEnum.YesNo],
              })),
              render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                  <YesNo isTrue={isActive} />
                </Tag>
              ),
            },
            {
              title: "Stores",
              dataIndex: "storeIds",
              key: "storeIds",
              align: "center",
              filters: stores.map((store) => ({
                value: store._id,
                text: store.name,
              })),
              render: (storeIds: string[]) => {
                return storeIds.map((storeId: string) => {
                  const store: IStore | undefined = getStore(storeId);

                  if (!store) {
                    return null;
                  }

                  return (
                    <Tag key={storeId}>
                      <span className="mr-1">{store.name ?? "No name"}</span>
                      <Badge
                        color={
                          StoresEnum.StatusBadgeColor[
                            store.status as StoresEnum.Status
                          ]
                        }
                      />
                    </Tag>
                  );
                });
              },
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, product: IProduct) => {
                return (
                  <>
                    <Tooltip title="Edit product">
                      <Button
                        className="mr-1"
                        type="success"
                        onClick={() => handleEditProduct(product)}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                  </>
                );
              },
            },
          ]}
          search={{ placeholder: "Search products.." }}
          loading={isLoading}
          pagination={{
            total,
          }}
        />
      </Card>
    </Layout>
  );
}
