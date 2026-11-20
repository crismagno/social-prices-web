import React, { ReactNode } from "react";

import { Button, Tooltip } from "antd";
import Link from "next/link";

import { ShoppingCartOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import {
  IGetSalesBalanceTotalsResponse,
  IGetSalesProductBalanceResponse,
} from "../../../../shared/business/sales/sales.type";
import Urls from "../../../../shared/common/routes-app/routes-app";
import ImagesEnum from "../../../../shared/utils/images/images.enum";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  className?: string;
  title?: string;
  icon?: ReactNode;
  iconClassName?: string;
  salesBalanceTotals?: IGetSalesBalanceTotalsResponse;
  storeId?: string;
  customerId?: string;
}

const DEFAULT_ICON_CLASS_NAME: string =
  "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300";

export const SalesBalanceStatistic: React.FC<Props> = ({
  className = "",
  title,
  icon,
  iconClassName = DEFAULT_ICON_CLASS_NAME,
  salesBalanceTotals = {
    quantity: 0,
    total: 0,
    productsBalance: [],
    salesQuantity: 0,
  },
  storeId,
  customerId,
}) => {
  const { t } = useLanguageData();

  const productsBalance: IGetSalesProductBalanceResponse[] =
    salesBalanceTotals.productsBalance ?? [];

  const getCreateSaleUrl = (
    productId: string,
    productItemId?: string
  ): string => {
    if (storeId) {
      return Urls.SALES_CREATE_BY_PRODUCT_AND_STORE.replace(
        ":productId",
        productId
      ).replace(":storeId", storeId);
    }

    if (customerId) {
      return Urls.SALES_CREATE_BY_PRODUCT_AND_CUSTOMER.replace(
        ":productId",
        productId
      ).replace(":customerId", customerId);
    }

    if (productItemId) {
      return Urls.SALES_CREATE_BY_PRODUCT_ITEM.replace(
        ":productItemId",
        productItemId
      );
    }

    return Urls.SALES_CREATE_BY_PRODUCT.replace(":productId", productId);
  };

  const getProductUrl = (productId: string, productItemId?: string): string =>
    productItemId
      ? Urls.PRODUCT_ITEM.replace(":productItemId", productItemId)
      : Urls.PRODUCT.replace(":productId", productId);

  const statClassName: string = `flex flex-col rounded-lg px-3 py-2
    bg-gray-50 dark:bg-gray-700/40`;

  return (
    <div
      className={`flex flex-col h-full rounded-xl border p-4
        border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className={`flex items-center justify-center shrink-0
              w-9 h-9 rounded-lg text-lg ${iconClassName}`}
          >
            {icon}
          </span>
        )}

        {title && (
          <span className="text-sm truncate text-gray-500 dark:text-gray-400">
            {title}
          </span>
        )}
      </div>

      <div
        className="mt-3 text-3xl font-semibold leading-tight tabular-nums
          text-slate-800 dark:text-white"
      >
        {formatToMoneyDecimal(salesBalanceTotals.total ?? 0)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={statClassName}>
          <span className="text-xs truncate text-gray-500 dark:text-gray-400">
            {t("sales.salesQuantity")}
          </span>

          <span className="text-base font-semibold tabular-nums text-slate-800 dark:text-white">
            {salesBalanceTotals.salesQuantity || 0}
          </span>
        </div>

        <div className={statClassName}>
          <span className="text-xs truncate text-gray-500 dark:text-gray-400">
            {t("sales.productQty")}
          </span>

          <span className="text-base font-semibold tabular-nums text-slate-800 dark:text-white">
            {salesBalanceTotals.quantity || 0}
          </span>
        </div>
      </div>

      <div
        className="mt-3 pt-3 pb-1 flex gap-2 overflow-x-auto
          border-t border-gray-100 dark:border-gray-700"
      >
        {productsBalance.length ? (
          productsBalance.map(
            (
              productBalance: IGetSalesProductBalanceResponse,
              index: number
            ) => {
              const productId: string = productBalance.product?._id!;

              const productItemId: string | undefined =
                productBalance.productItem?._id;

              const name: string | undefined =
                productBalance.productItem?.name ??
                productBalance.product?.name;

              return (
                <div
                  key={`${productId}-${productItemId ?? index}`}
                  className="flex items-center gap-2 shrink-0 w-56 rounded-lg p-2
                    bg-gray-50 dark:bg-gray-700/40"
                >
                  <ImageOrDefault
                    src={
                      productBalance.productItem?.mainUrl ??
                      productBalance.product?.mainUrl
                    }
                    width={36}
                    className="rounded-md"
                    defaultImage={ImagesEnum.FilesNames.DefaultProductImage}
                  />

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                      href={getProductUrl(productId, productItemId)}
                      className="text-sm truncate text-slate-800
                        hover:text-blue-500 dark:text-white"
                    >
                      {name}
                    </Link>

                    <span className="text-xs truncate text-gray-500 dark:text-gray-400">
                      {formatToMoneyDecimal(productBalance.total ?? 0)} ·{" "}
                      {t("common.qty")}: {productBalance.quantity ?? 0}
                    </span>
                  </div>

                  <Tooltip title={t("sales.createSaleByProduct")}>
                    <Link href={getCreateSaleUrl(productId, productItemId)}>
                      <Button
                        type="text"
                        size="small"
                        icon={<ShoppingCartOutlined />}
                        aria-label={t("sales.createSaleByProduct")}
                      />
                    </Link>
                  </Tooltip>
                </div>
              );
            }
          )
        ) : (
          <span className="flex items-center h-[52px] text-xs text-gray-400">
            {t("common.noData")}
          </span>
        )}
      </div>
    </div>
  );
};
