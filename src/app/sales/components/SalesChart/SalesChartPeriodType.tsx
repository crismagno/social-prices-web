import React from "react";

import { Divider, Select } from "antd";
import { find, map, reduce } from "lodash";
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
import { ITotalQuantity } from "../../../../shared/common/interfaces/global.interface";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string-extensions";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
  onChange: (periodType: ChartsEnum.PeriodType) => void;
  periodType: ChartsEnum.PeriodType;
}

export const SalesChartPeriodType: React.FC<Props> = ({
  salesAnalytics,
  onChange,
  periodType,
}) => {
  const chartDataPeriodType: IChartDataPeriodTypeItem[] =
    salesAnalytics?.chartDataPeriodType ?? [];

  const totalQuantityByData: ITotalQuantity = reduce(
    chartDataPeriodType,
    (acc: ITotalQuantity, curr: IChartDataPeriodTypeItem) => {
      acc.total += curr.total;
      acc.quantity += curr.quantity;

      return acc;
    },
    {
      total: 0,
      quantity: 0,
    }
  ) || { total: 0, quantity: 0 };

  const renderTooltip = (props: any) => {
    const { active, payload } = props;

    if (!active || !payload?.length) {
      return null;
    }

    const item: IChartDataPeriodTypeItem = payload[0].payload;

    const itemTotal: number = item?.total ?? 0;

    const itemQuantity: number = item?.quantity ?? 0;

    const percentageByTotal: number =
      (itemTotal * 100) / totalQuantityByData.total;

    const percentageByQuantity: number =
      (itemQuantity * 100) / totalQuantityByData.quantity;

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

  const renderXAxis = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value } = payload;

    const valueFormatted: string = `${value}${ChartsEnum.PeriodTypeShortLabel[periodType]}`;

    const item: IChartDataPeriodTypeItem | undefined = find(
      chartDataPeriodType,
      { name: value }
    );

    const itemTotal: number = item?.total || 0;

    const percentageByTotal: number =
      (itemTotal * 100) / totalQuantityByData.total || 0;

    return (
      <>
        <text
          style={{ fontSize: "0.7rem" }}
          textAnchor="middle"
          x={x}
          y={y + 8}
          rotate={10}
        >
          {valueFormatted}
        </text>
        <text
          fill="#1677FE"
          style={{ fontSize: "0.5rem" }}
          textAnchor="middle"
          x={x}
          y={y + 20}
          rotate={10}
        >
          {percentageByTotal.toFixed(1)}%
        </text>
      </>
    );
  };

  const renderYAxis = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value } = payload;

    return (
      <>
        <text
          style={{ fontSize: "0.6rem" }}
          textAnchor="middle"
          x={x - 24}
          y={y + 4}
        >
          {formatToMoneyDecimal(value)}
        </text>
      </>
    );
  };

  return (
    <>
      <div>
        <label className="font-semibold mr-2">Sales Revenue by Period: </label>

        <Select style={{ width: 120 }} value={periodType} onChange={onChange}>
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

      <div className="ml-5">
        <ResponsiveContainer width={"100%"} height={390}>
          <AreaChart
            data={chartDataPeriodType}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={renderXAxis} />
            <YAxis tick={renderYAxis} />

            <Tooltip content={renderTooltip} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#1677FE"
              fill="#1677FE"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="text-center mt-1">
          <span className="font-semibold">
            Total:
            <span className="ml-1">
              {formatToMoneyDecimal(totalQuantityByData.total)}
            </span>
          </span>

          <Divider type="vertical" />

          <span className="font-semibold">
            Quantity:
            <span className="ml-1">{totalQuantityByData.quantity}</span>
          </span>
        </div>
      </div>
    </>
  );
};
