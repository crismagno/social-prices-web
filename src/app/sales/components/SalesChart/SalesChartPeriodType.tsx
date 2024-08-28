import React, { useState } from "react";

import { Select } from "antd";
import { map } from "lodash";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { IGetSalesAnalyticsResponse } from "../../../../services/social-prices-api/sales/sales-service.types";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";
import { formatToMoneyDecimal } from "../../../../shared/utils/string-extensions/string-extensions";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
  onChange: (periodType: ChartsEnum.PeriodType) => void;
}

export const SalesChartPeriodType: React.FC<Props> = ({
  salesAnalytics,
  onChange,
}) => {
  const [periodType, setPeriodType] = useState<ChartsEnum.PeriodType>(
    ChartsEnum.PeriodType.MONTH
  );

  const allTotal: number =
    salesAnalytics?.chartDataPeriodType?.reduce(
      (acc: number, curr: IChartDataPeriodTypeItem) => (acc += curr.total),
      0
    ) ?? 0;

  const allQuantity: number =
    salesAnalytics?.chartDataPeriodType?.reduce(
      (acc: number, curr: IChartDataPeriodTypeItem) => (acc += curr.quantity),
      0
    ) ?? 0;

  const renderTooltip = (props: any) => {
    const { active, payload } = props;

    if (!active || !payload?.length) {
      return null;
    }

    const item: IChartDataPeriodTypeItem = payload[0].payload;

    const percentageByTotal: number = (item?.total * 100) / allTotal;

    const percentageByQuantity: number = (item?.quantity * 100) / allQuantity;

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
        }}
      >
        <p>{`${ChartsEnum.PeriodTypeLabel[periodType]}: ${item.name} `}</p>
        <p>{`Total: ${formatToMoneyDecimal(item.total)}`}</p>
        <p>{`Percentage by Total: ${percentageByTotal.toFixed(2)}%`}</p>
        <p>{`Quantity: ${item.quantity}`}</p>
        <p>{`Percentage by Quantity: ${percentageByQuantity.toFixed(2)}%`}</p>
      </div>
    );
  };

  return (
    <>
      <div>
        <label className="font-semibold mr-2">Sales Revenue by Period: </label>

        <Select
          style={{ width: 120 }}
          value={periodType}
          onChange={(value: ChartsEnum.PeriodType) => {
            setPeriodType(value);
            onChange(value);
          }}
        >
          {map(
            Object.keys(ChartsEnum.PeriodType),
            (periodTypeParam: ChartsEnum.PeriodType) => (
              <Select.Option key={periodTypeParam} value={periodTypeParam}>
                {ChartsEnum.PeriodTypeLabel[periodTypeParam]}
              </Select.Option>
            )
          )}
        </Select>
      </div>

      <ResponsiveContainer width={"100%"} height={370}>
        <AreaChart
          data={salesAnalytics?.chartDataPeriodType}
          margin={{
            top: 10,
            right: 30,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          {/* <Tooltip /> */}

          <Tooltip content={renderTooltip} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#1677FE"
            fill="#1677FE"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};
