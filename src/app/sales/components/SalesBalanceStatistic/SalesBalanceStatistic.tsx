import React from "react";

import { Card, Divider, Tooltip } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import {
  IGetSalesBalanceTotalsResponse,
  IGetSalesProductBalanceResponse,
} from "../../../../shared/business/sales/sales.type";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  className?: string;
  title?: string;
  salesBalanceTotals?: IGetSalesBalanceTotalsResponse;
}

export const SalesBalanceStatistic: React.FC<Props> = ({
  className,
  title,
  salesBalanceTotals = {
    quantity: 0,
    total: 0,
    productsBalance: [],
  },
}) => {
  const router: AppRouterInstance = useRouter();

  const firstProductBalance: IGetSalesProductBalanceResponse | undefined =
    salesBalanceTotals?.productsBalance?.[0];

  return (
    <Card className={`p-1 text-family-1 ${className}`}>
      {title && <label className="text-lg color-gray-1">{title}</label>}

      <div className="my-2 flex items-center text-family-1">
        <div>
          <label className="color-black-1 text-3xl">
            {formatToMoneyDecimal(salesBalanceTotals.total)}
          </label>
        </div>

        <Divider type="vertical" dashed />

        <div>
          <label className="color-black-1">Qty: </label>
          <label className="color-black-1 text-lg">
            {salesBalanceTotals.quantity}
          </label>
        </div>
      </div>

      <Divider type="horizontal" className="my-3" />

      <Tooltip title="Create Sale By Product">
        <div
          className="flex flex-row items-center justify-start w-full border p-2 rounded-lg cursor-pointer"
          onClick={() =>
            firstProductBalance?.product &&
            router.push(
              Urls.SALES_CREATE_BY_PRODUCT.replace(
                ":productId",
                firstProductBalance.product?._id
              )
            )
          }
        >
          <div className="mr-5 flex items-center">
            <ImageOrDefault src={firstProductBalance?.product?.mainUrl} />
          </div>

          <div className="flex flex-col">
            <label className="color-black-1 text-base">
              {firstProductBalance?.product?.name}
            </label>
            <label className="color-gray-1 text-sm">
              Total: {formatToMoneyDecimal(firstProductBalance?.total)} | Qty:{" "}
              {firstProductBalance?.quantity}
            </label>
          </div>
        </div>
      </Tooltip>
    </Card>
  );
};
