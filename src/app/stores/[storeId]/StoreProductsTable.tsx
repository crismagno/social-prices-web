"use client";

import { useMemo, useState } from "react";

import { Button, Image, Tag, Tooltip } from "antd";
import Link from "next/link";

import { EnterOutlined } from "@ant-design/icons";

import YesNo from "../../../components/common/YesNo/YesNo";
import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IProduct } from "../../../shared/business/products/products.interface";
import CommonEnum from "../../../shared/common/enums/common.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { formatterMoney } from "../../../shared/utils/strings/string";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { useFindProductsByUserTableState } from "../../products/useFindProductsByUserTableState";

interface Props {
  storeId: string;
}

// The products sold in this store: the products list, always filtered to it.
export default function StoreProductsTable({ storeId }: Props) {
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IProduct> | undefined
  >(createTableState({ sort: { field: "name", order: "ascend" } }));

  // The table replaces its filters on every change, so the store is added here,
  // on the way to the API, and can never be lost.
  const requestForStore = useMemo<ITableStateRequest<IProduct> | undefined>(
    () =>
      tableStateRequest && {
        ...tableStateRequest,
        filters: { ...tableStateRequest.filters, storeIds: [storeId] },
      },
    [tableStateRequest, storeId],
  );

  const { products, total, isLoading } =
    useFindProductsByUserTableState(requestForStore);

  return (
    <TableCustomAntd2<IProduct>
      rowKey={"_id"}
      dataSource={products}
      loading={isLoading}
      tableStateRequest={tableStateRequest}
      setTableStateRequest={setTableStateRequest}
      total={total}
      scroll={{ x: "max-content" }}
      columns={[
        {
          title: "#",
          dataIndex: "filesUrl",
          key: "filesUrl",
          align: "center",
          render: (filesUrl: string[]) => (
            <Image
              width={50}
              height={50}
              src={
                filesUrl?.length
                  ? getImageUrl(filesUrl[0])
                  : ImagesEnum.FilesNames.DefaultProductImage
              }
              alt=""
              className="rounded-full"
              fallback={ImagesEnum.FilesNames.DefaultProductImage}
            />
          ),
        },
        {
          title: t("common.name"),
          dataIndex: "name",
          key: "name",
          sorter: true,
          align: "center",
          render: (_: any, product: IProduct) => (
            <div className="flex flex-col items-center justify-center">
              <span>{product.name}</span>
              <span className="text-sm italic text-slate-500">
                {product.brand}
              </span>
            </div>
          ),
        },
        {
          title: t("products.sku"),
          dataIndex: "sku",
          key: "sku",
          sorter: true,
          align: "center",
          render: (sku: string) => sku || "-",
        },
        {
          title: t("common.quantity"),
          dataIndex: "quantity",
          key: "quantity",
          sorter: true,
          align: "center",
          render: (quantity: number) => (
            <span className={quantity <= 0 ? "text-red-600" : undefined}>
              {quantity}
            </span>
          ),
        },
        {
          title: t("common.price"),
          dataIndex: "price",
          key: "price",
          sorter: true,
          align: "center",
          render: (price: number) => formatterMoney(price),
        },
        {
          title: t("common.active"),
          dataIndex: "isActive",
          key: "isActive",
          align: "center",
          filters: Object.keys(CommonEnum.YesNo).map((value: string) => ({
            value: value === CommonEnum.YesNo.YES,
            text: t(CommonEnum.YesNoLabels[value as CommonEnum.YesNo]),
          })),
          render: (isActive: boolean) => (
            <Tag color={isActive ? "green" : "red"}>
              <YesNo isTrue={isActive} />
            </Tag>
          ),
        },
        {
          title: t("common.actions"),
          dataIndex: "action",
          key: "action",
          align: "center",
          fixed: "right",
          render: (_: any, product: IProduct) => (
            <Tooltip title={t("products.goToProduct")}>
              <Link href={Urls.PRODUCT.replace(":productId", product._id)}>
                <Button icon={<EnterOutlined />} />
              </Link>
            </Tooltip>
          ),
        },
      ]}
    />
  );
}
