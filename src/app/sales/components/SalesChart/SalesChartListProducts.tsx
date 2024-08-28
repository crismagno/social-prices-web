import React, { useState } from "react";

import { List } from "antd";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import SelectByQuantityOrTotal from "../../../../components/common/SelectByQuantityOrTotal/SelectByQuantityOrTotal";
import { IGetSalesAnalyticsResponse } from "../../../../services/social-prices-api/sales/sales-service.types";
import CommonEnum from "../../../../shared/common/enums/common.enum";
import { IChartDataProductItem } from "../../../../shared/utils/charts/charts-types";
import { formatToMoneyDecimal } from "../../../../shared/utils/string-extensions/string-extensions";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
}

export const SalesChartListProducts: React.FC<Props> = ({ salesAnalytics }) => {
  const [data, setData] = useState<IChartDataProductItem[]>(
    salesAnalytics?.chartDataProductsByTotal ?? []
  );

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
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<ImageOrDefault src={item.mainUrl} />}
              title={<a href="#">{item.name}</a>}
              description={`Total: ${formatToMoneyDecimal(item.total)} | Qty: ${
                item.quantity
              }`}
            />
          </List.Item>
        )}
      />
    </>
  );
};
