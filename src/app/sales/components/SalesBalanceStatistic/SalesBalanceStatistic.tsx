import React from "react";

import { Card, Divider, Tooltip } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import Urls from "../../../../shared/common/routes-app/routes-app";

interface Props {
  className?: string;
  title?: string;
}

export const SalesBalanceStatistic: React.FC<Props> = ({
  className,
  title,
}) => {
  const router: AppRouterInstance = useRouter();

  const balance = 0;

  const quantity = 0;

  const product = {
    mainUrl: "",
    name: "test",
    total: 0,
    quantity: 0,
    productId: "",
  };

  return (
    <Card className={`p-1 text-family-1 ${className}`}>
      {title && <label className="text-lg color-gray-1">{title}</label>}

      <div className="my-2 flex items-center text-family-1">
        <div>
          <label className="color-black-1">$</label>
          <label className="color-black-1 text-3xl">{balance}</label>
        </div>

        <Divider type="vertical" dashed />

        <div>
          <label className="color-black-1">Qty: </label>
          <label className="color-black-1 text-lg">{quantity}</label>
        </div>
      </div>

      <Divider type="horizontal" className="my-3" />

      <Tooltip title="Create Sale By Product">
        <div
          className="flex flex-row items-center justify-start w-full border p-2 rounded-lg cursor-pointer"
          onClick={() =>
            router.push(
              Urls.SALES_CREATE_BY_PRODUCT.replace(
                ":productId",
                product.productId
              )
            )
          }
        >
          <div className="mr-5 flex items-center">
            <ImageOrDefault src={product.mainUrl} />
          </div>

          <div className="flex flex-col">
            <label className="color-black-1 text-base">{product.name}</label>
            <label className="color-gray-1 text-sm">
              Total: {product.total} | Qty: {product.quantity}
            </label>
          </div>
        </div>
      </Tooltip>
    </Card>
  );
};
