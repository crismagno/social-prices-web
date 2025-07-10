import React, { useState } from "react";

import { Button, List, Tooltip } from "antd";
import { reduce } from "lodash";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ShoppingCartOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import SelectByQuantityOrTotal from "../../../../components/common/SelectByQuantityOrTotal/SelectByQuantityOrTotal";
import { IGetSalesAnalyticsResponse } from "../../../../shared/business/sales/sales.type";
import CommonEnum from "../../../../shared/common/enums/common.enum";
import { ITotalQuantity } from "../../../../shared/common/interfaces/global.interface";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { IChartDataProductItem } from "../../../../shared/utils/charts/charts-types";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
}

export const SalesChartListProducts: React.FC<Props> = ({ salesAnalytics }) => {
  const router: AppRouterInstance = useRouter();

  const [data, setData] = useState<IChartDataProductItem[]>(
    salesAnalytics?.chartDataProductsByTotal ?? []
  );

  const totalAndQuantityByData: ITotalQuantity = reduce(
    data,
    (acc: ITotalQuantity, curr: IChartDataProductItem) => {
      acc.total += curr.total;
      acc.quantity += curr.quantity;

      return acc;
    },
    {
      total: 0,
      quantity: 0,
    }
  ) || { total: 0, quantity: 0 };

  const totalItem: IChartDataProductItem = {
    name: "Total",
    productId: "",
    quantity: totalAndQuantityByData.quantity,
    total: totalAndQuantityByData.total,
  };

  return (
    <>
      <SelectByQuantityOrTotal
        label="Products by Highest Sales Revenue: "
        onChange={(quantityOrTotal: CommonEnum.QuantityOrTotal) => {
          setData(
            quantityOrTotal === CommonEnum.QuantityOrTotal.TOTAL
              ? salesAnalytics?.chartDataProductsByTotal ?? []
              : salesAnalytics?.chartDataProductsByQuantity ?? []
          );
        }}
      />

      <List
        dataSource={[...data, totalItem]}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={<ImageOrDefault src={item.mainUrl} />}
              title={
                <a
                  href={Urls.EDIT_PRODUCT.replace(":productId", item.productId)}
                >
                  {item.name}
                </a>
              }
              description={
                <div className="flex justify-between">
                  <div>
                    Total: {formatToMoneyDecimal(item.total)} | Qty:{" "}
                    {item.quantity}
                  </div>

                  {item.productId && (
                    <Tooltip title="Create Sale By Product">
                      <Button
                        className="ml-3"
                        type="primary"
                        size="small"
                        onClick={() =>
                          router.push(
                            Urls.SALES_CREATE_BY_PRODUCT.replace(
                              ":productId",
                              item.productId
                            )
                          )
                        }
                        icon={<ShoppingCartOutlined />}
                      />
                    </Tooltip>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};
