import React from "react";

import { find, reduce } from "lodash";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { IGetSalesAnalyticsResponse } from "../../../../shared/business/sales/sales.type";
import { ITotalQuantitySalesQuantity } from "../../../../shared/common/interfaces/global.interface";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";

interface Props {
  periodType: ChartsEnum.PeriodType;
  chartProps?: {
    width?: number | string;
    height?: number | string;
    totalColor?: string;
    quantityColor?: string;
  };
  title?: string;
  salesAnalytics?: IGetSalesAnalyticsResponse | null;
}

export const SalesQuantityChartStatistic: React.FC<Props> = ({
  periodType,
  chartProps,
  title,
  salesAnalytics,
}) => {
  const chartDataPeriodType: IChartDataPeriodTypeItem[] =
    salesAnalytics?.chartDataPeriodType ?? [];

  const totalQuantityByData: ITotalQuantitySalesQuantity = reduce(
    chartDataPeriodType,
    (acc: ITotalQuantitySalesQuantity, curr: IChartDataPeriodTypeItem) => {
      acc.total += curr.total;
      acc.quantity += curr.quantity;
      acc.salesQuantity = (acc.salesQuantity || 0) + (curr.salesQuantity || 0);

      return acc;
    },
    {
      total: 0,
      quantity: 0,
      salesQuantity: 0,
    }
  ) || { total: 0, quantity: 0, salesQuantity: 0 };

  const renderTooltip = (props: any) => {
    const { active, payload } = props;

    if (!active || !payload?.length) {
      return null;
    }

    const item: IChartDataPeriodTypeItem = payload[0].payload;

    const itemSalesQuantity: number = item?.salesQuantity ?? 0;

    const percentageBySalesQuantity: number =
      (itemSalesQuantity * 100) / (totalQuantityByData.salesQuantity || 1);

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
        }}
      >
        <p>{`${ChartsEnum.PeriodTypeLabel[periodType]}: ${item.name} `}</p>
        <p>{`Sales Quantity: ${itemSalesQuantity}`}</p>
        <p>{`Percentage by Sales Quantity: ${percentageBySalesQuantity.toFixed(
          2
        )}%`}</p>
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

    const itemSalesQuantity: number = item?.salesQuantity || 0;

    const percentageByQuantity: number =
      (itemSalesQuantity * 100) / (totalQuantityByData.salesQuantity || 1);

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
          fill="#389e0d"
          style={{ fontSize: "0.5rem" }}
          textAnchor="middle"
          x={x}
          y={y + 20}
          rotate={10}
        >
          {percentageByQuantity.toFixed(1)}%
        </text>
      </>
    );
  };

  const renderYAxisTotal = (tickProps: any) => {
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
          {value}
        </text>
      </>
    );
  };

  return (
    <>
      <div className="w-full text-center">
        {title ? (
          <label className="font-semibold">{title}</label>
        ) : (
          <>
            <span className="mr-2">Sales Amount by Period:</span>

            <label className="font-semibold">
              {ChartsEnum.PeriodTypeLabel[periodType]}
            </label>
          </>
        )}
      </div>

      <div className="ml-5">
        <ResponsiveContainer
          width={chartProps?.width ?? "100%"}
          height={chartProps?.height ?? 390}
        >
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
            <YAxis tick={renderYAxisTotal} yAxisId="salesQuantity" />

            <Tooltip content={renderTooltip} />
            <Legend />

            <Area
              type="monotone"
              dataKey="salesQuantity"
              name="Sales Quantity"
              stroke={chartProps?.totalColor ?? "#73d13d"}
              fillOpacity={0.5}
              fill={chartProps?.totalColor ?? "#73d13d"}
              yAxisId="salesQuantity"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="text-center mt-1">
          <span className="font-semibold">
            Sales Quantity:
            <span className="ml-1">
              {totalQuantityByData.salesQuantity || 0}
            </span>
          </span>
        </div>
      </div>
    </>
  );
};
