import React, { useState } from "react";

import { Divider } from "antd";
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

import Loading from "../../../../components/common/Loading/Loading";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { IGetSalesAnalyticsParams } from "../../../../shared/business/sales/sales.type";
import { ITotalQuantity } from "../../../../shared/common/interfaces/global.interface";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";
import { useGetSalesAnalytics } from "../../useGetSalesAnalytics";

interface Props {
  periodType: ChartsEnum.PeriodType;
  chartProps?: {
    width?: number | string;
    height?: number | string;
    totalColor?: string;
    quantityColor?: string;
  };
  rangeDate: {
    startDate: Date;
    endDate: Date;
  };
  title?: string;
  storeId?: string;
}

export const SalesChartStatistic: React.FC<Props> = ({
  periodType,
  chartProps,
  title,
  rangeDate,
  storeId,
}) => {
  const [getSalesAnalyticsParams] = useState<IGetSalesAnalyticsParams>({
    periodType,
    rangeDate,
    storesIds: storeId ? [storeId] : undefined,
    status: SalesEnum.StatusToFilterCharts,
  });

  const { isLoading, salesAnalytics } = useGetSalesAnalytics(
    getSalesAnalyticsParams
  );

  if (isLoading) {
    return <Loading />;
  }

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
          {formatToMoneyDecimal(value)}
        </text>
      </>
    );
  };

  const renderYAxisQuantity = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value } = payload;

    return (
      <>
        <text
          style={{ fontSize: "0.6rem" }}
          textAnchor="middle"
          x={x + 15}
          y={y + 4}
        >
          Qty: {value}
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
            <span className="mr-2">Sales by Period:</span>

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
            <YAxis tick={renderYAxisTotal} yAxisId="total" />
            <YAxis
              tick={renderYAxisQuantity}
              yAxisId="quantity"
              orientation="right"
            />

            <Tooltip content={renderTooltip} />
            <Legend />

            <Area
              type="monotone"
              dataKey="total"
              stroke={chartProps?.totalColor ?? "#8dc5f8"}
              fillOpacity={0.5}
              fill={chartProps?.totalColor ?? "#8dc5f8"}
              yAxisId="total"
            />
            <Area
              type="monotone"
              dataKey="quantity"
              stroke={chartProps?.quantityColor ?? "#1f1f1f"}
              fillOpacity={1}
              fill="url(#colorPv)"
              yAxisId="quantity"
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
