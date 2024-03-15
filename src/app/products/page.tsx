"use client";

import { useState } from "react";

import { Button, Card, Image, TablePaginationConfig, Tooltip } from "antd";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";
import { RecordType } from "zod";

import { EditOutlined, EnterOutlined, PlusOutlined } from "@ant-design/icons";

import TableCustomAntd from "../../components/custom/antd/TableCustomAntd/TableCustomAntd";
import Layout from "../../components/template/Layout/Layout";
import { IProduct } from "../../shared/business/products/products.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageAwsS3 } from "../../shared/utils/images/url-images";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindProductsByUserTableState } from "./useFindProductsByUserTableState";

export default function Products() {
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >();

  const { isLoading, products, total } =
    useFindProductsByUserTableState(tableStateRequest);

  const handleNewProduct = () => {
    router.push(Urls.NEW_PRODUCT);
  };

  const handleEditProduct = (product: IProduct) => {
    router.push(Urls.EDIT_PRODUCT.replace(":productId", product._id));
  };

  const handleGotToProduct = (product: IProduct) => {
    console.log(product);
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
      sort: { field: sorter.field, order: sorter.order },
      action: extra.action,
    });
  };

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
              dataIndex: "mainUrl",
              key: "mainUrl",
              align: "center",
              render: (mainUrl: string) => {
                if (!mainUrl) {
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
                  <Tooltip title="See product">
                    <Image
                      width={50}
                      height={50}
                      src={getImageAwsS3(mainUrl)}
                      alt="mainUrl"
                      className="rounded-full"
                    />
                  </Tooltip>
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
                    <Tooltip title="Go to store">
                      <Button
                        type="primary"
                        onClick={() => handleGotToProduct(product)}
                        icon={<EnterOutlined />}
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
