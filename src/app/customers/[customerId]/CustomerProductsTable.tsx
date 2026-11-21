"use client";

import React from "react";

import { Button, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import Link from "next/link";

import { ShoppingCartOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../../../components/common/ImageOrDefault/ImageOrDefault";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IGetCustomerProductResponse } from "../../../shared/business/sales/sales.type";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { formatToMoneyDecimal } from "../../../shared/utils/strings/string";
import { useGetProductsByCustomer } from "./useGetProductsByCustomer";

interface Props {
  customerId: string;
}

const getProductUrl = (customerProduct: IGetCustomerProductResponse): string =>
  customerProduct.productItemId
    ? Urls.PRODUCT_ITEM.replace(":productItemId", customerProduct.productItemId)
    : Urls.PRODUCT.replace(":productId", customerProduct.productId);

const CustomerProductsTable: React.FC<Props> = ({ customerId }) => {
  const { t } = useLanguageData()!;

  const { isLoading, customerProducts } = useGetProductsByCustomer(customerId);

  const columns: ColumnsType<IGetCustomerProductResponse> = [
    {
      title: t("sales.product"),
      key: "product",
      render: (_: unknown, customerProduct: IGetCustomerProductResponse) => (
        <div className="flex items-center gap-2">
          <ImageOrDefault
            src={
              customerProduct.productItem?.mainUrl ??
              customerProduct.product?.mainUrl
            }
            width={36}
            className="rounded-md"
            defaultImage={ImagesEnum.FilesNames.DefaultProductImage}
          />

          <Link href={getProductUrl(customerProduct)}>
            {customerProduct.productItem?.name ??
              customerProduct.product?.name ??
              "-"}
          </Link>
        </div>
      ),
    },
    {
      title: t("common.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: t("customers.purchases"),
      dataIndex: "salesQuantity",
      key: "salesQuantity",
      align: "right",
      sorter: (a, b) => a.salesQuantity - b.salesQuantity,
    },
    {
      title: t("common.total"),
      dataIndex: "total",
      key: "total",
      align: "right",
      sorter: (a, b) => a.total - b.total,
      render: (total: number) => formatToMoneyDecimal(total ?? 0),
    },
    {
      title: t("customers.lastPurchase"),
      dataIndex: "lastPurchaseAt",
      key: "lastPurchaseAt",
      sorter: (a, b) =>
        moment(a.lastPurchaseAt).valueOf() - moment(b.lastPurchaseAt).valueOf(),
      render: (lastPurchaseAt: Date) =>
        moment(lastPurchaseAt).format(DatesEnum.Format.DDMMYYY),
    },
    {
      key: "actions",
      align: "right",
      render: (_: unknown, customerProduct: IGetCustomerProductResponse) => (
        <Tooltip title={t("sales.createSaleByProduct")}>
          <Link
            href={Urls.SALES_CREATE_BY_PRODUCT_AND_CUSTOMER.replace(
              ":productId",
              customerProduct.productId,
            ).replace(":customerId", customerId)}
          >
            <Button
              type="text"
              size="small"
              icon={<ShoppingCartOutlined />}
              aria-label={t("sales.createSaleByProduct")}
            />
          </Link>
        </Tooltip>
      ),
    },
  ];

  return (
    <Table<IGetCustomerProductResponse>
      rowKey={(customerProduct: IGetCustomerProductResponse) =>
        `${customerProduct.productId}-${customerProduct.productItemId}`
      }
      columns={columns}
      dataSource={customerProducts}
      loading={isLoading}
      scroll={{ x: "max-content" }}
    />
  );
};

export default CustomerProductsTable;
