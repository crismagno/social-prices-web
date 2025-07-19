import React from "react";

import { Card, Divider } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ShoppingCartOutlined } from "@ant-design/icons";

import { AvatarDescription } from "../../../../components/common/AvatarDescription/AvatarDescription";
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
  storeId?: string;
}

export const SalesBalanceStatistic: React.FC<Props> = ({
  className,
  title,
  salesBalanceTotals = {
    quantity: 0,
    total: 0,
    productsBalance: [],
  },
  storeId,
}) => {
  const router: AppRouterInstance = useRouter();

  const productBalance: IGetSalesProductBalanceResponse | undefined =
    salesBalanceTotals?.productsBalance?.[0];

  const renderProductsBalance = () => {
    if (salesBalanceTotals.productsBalance?.length) {
      return (
        <>
          {salesBalanceTotals.productsBalance.map(
            (
              productBalance: IGetSalesProductBalanceResponse,
              index: number
            ) => {
              const productId: string = productBalance.product?._id!;

              return (
                <AvatarDescription
                  key={index}
                  src={productBalance?.product?.mainUrl}
                  buttonIcon={<ShoppingCartOutlined />}
                  buttonTooltip="Create Sale By Product"
                  onClickButton={() => {
                    if (storeId) {
                      router.push(
                        Urls.SALES_CREATE_BY_PRODUCT_AND_STORE.replace(
                          ":productId",
                          productId
                        ).replace(":storeId", storeId)
                      );
                    } else {
                      router.push(
                        Urls.SALES_CREATE_BY_PRODUCT.replace(
                          ":productId",
                          productId
                        )
                      );
                    }
                  }}
                  onClickTitleButton={() =>
                    router.push(
                      Urls.EDIT_PRODUCT.replace(":productId", productId)
                    )
                  }
                  title={productBalance?.product?.name}
                  subtitle={`Total: ${formatToMoneyDecimal(
                    productBalance?.total
                  )} | Qty: ${productBalance?.quantity}`}
                  className={index > 0 ? "ml-2" : ""}
                />
              );
            }
          )}
        </>
      );
    }

    return (
      <AvatarDescription
        src={productBalance?.product?.mainUrl}
        buttonIcon={<ShoppingCartOutlined />}
        buttonTooltip="Create Sale By Product"
        onClickButton={
          productBalance?.product
            ? () =>
                router.push(
                  Urls.SALES_CREATE_BY_PRODUCT.replace(
                    ":productId",
                    productBalance.product?._id!
                  )
                )
            : undefined
        }
        styleLeft={{ width: productBalance?.product ? 282 : 318 }}
        title={productBalance?.product?.name}
        subtitle={`Total: ${formatToMoneyDecimal(
          productBalance?.total
        )} | Qty: ${productBalance?.quantity ?? 0}`}
      />
    );
  };

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

      <div className="flex w-full overflow-y-hidden pb-2">
        {renderProductsBalance()}
      </div>
    </Card>
  );
};
