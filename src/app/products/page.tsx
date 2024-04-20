"use client";

import { useState } from "react";

import {
  Avatar,
  Button,
  Card,
  Image,
  TablePaginationConfig,
  Tag,
  Tooltip,
} from "antd";
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

import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import YesNo from "../../components/common/YesNo/YesNo";
import TableCustomAntd from "../../components/custom/antd/TableCustomAntd/TableCustomAntd";
import Layout from "../../components/template/Layout/Layout";
import ProductsEnum from "../../shared/business/products/products.enum";
import { IProduct } from "../../shared/business/products/products.interface";
import CommonEnum from "../../shared/common/enums/common.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../shared/utils/images/url-images";
import { formatterMoney } from "../../shared/utils/string-extensions/string-extensions";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindStoresByUser } from "../stores/useFindStoresByUser";
import { useFindProductsByUserTableState } from "./useFindProductsByUserTableState";

export default function Products() {
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, products, total } =
    useFindProductsByUserTableState(tableStateRequest);

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const handleNewProduct = () => {
    router.push(Urls.NEW_PRODUCT);
  };

  const handleEditProduct = (product: IProduct) => {
    router.push(Urls.EDIT_PRODUCT.replace(":productId", product._id));
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

  if (isLoadingStores) {
    return <LoadingFull />;
  }

  const getStoreName = (storeId: string) =>
    stores.find((store) => store._id === storeId)?.name ?? "";

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
        <TableCustomAntd<IProduct>
          rowKey={"_id"}
          onChange={handleChangeTable}
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
                        src={getImageAwsS3(fileUrl)}
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
              dataIndex: "categoriesCode",
              key: "categoriesCode",
              align: "center",
              render: (categoriesCode: string[]) =>
                categoriesCode?.length
                  ? categoriesCode.map((categoryCode) => (
                      <Tag key={categoryCode}>
                        {
                          ProductsEnum.categories.find(
                            (category) => category.code === categoryCode
                          )?.name
                        }
                      </Tag>
                    ))
                  : "None categories",
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
              render: (storeIds: string[]) =>
                storeIds.map((storeId: string) => (
                  <Tag key={storeId}>{getStoreName(storeId)}</Tag>
                )),
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
          search={{ onSearch, placeholder: "Search products.." }}
          loading={isLoading}
          pagination={{
            total,
          }}
        />
      </Card>
    </Layout>
  );
}
