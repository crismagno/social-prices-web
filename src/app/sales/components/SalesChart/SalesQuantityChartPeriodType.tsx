import React from "react";

import { Select, Tag } from "antd";
import { find, map, reduce } from "lodash";
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
  salesAnalytics: IGetSalesAnalyticsResponse | null;
  onChange?: (periodType: ChartsEnum.PeriodType) => void;
  periodType: ChartsEnum.PeriodType;
}

export const SalesQuantityChartPeriodType: React.FC<Props> = ({
  salesAnalytics,
  onChange,
  periodType,
}) => {
  const chartDataPeriodType: IChartDataPeriodTypeItem[] =
    salesAnalytics?.chartDataPeriodType ?? [];

  const totalByData: ITotalQuantitySalesQuantity = reduce(
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
      (itemSalesQuantity * 100) / (totalByData.salesQuantity || 1);

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "5px",
        }}
      >
        <p>{`${ChartsEnum.PeriodTypeLabel[periodType]}: ${item.name} `}</p>
        <p>{`Sales Quantity Total: ${item.salesQuantity}`}</p>
        <p>{`Percentage by Sales Quantity Total: ${percentageBySalesQuantity.toFixed(
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

    const percentageBySalesQuantity: number =
      (itemSalesQuantity * 100) / (totalByData.salesQuantity || 1) || 0;

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
          {percentageBySalesQuantity.toFixed(1)}%
        </text>
      </>
    );
  };

  const renderYAxisSalesQuantity = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const { value } = payload;

    return (
      <>
        <text
          style={{ fontSize: "0.6rem" }}
          textAnchor="middle"
          x={x - 4}
          y={y + 4}
        >
          {value}
        </text>
      </>
    );
  };

  const periodTypeLabel: string = ChartsEnum.PeriodTypeLabel[periodType];

  return (
    <>
      <div className="flex items-center justify-center">
        <label className="font-semibold mr-2">Sales Quantity by Period: </label>

        {onChange ? (
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
        ) : (
          <Tag>{periodTypeLabel}</Tag>
        )}
      </div>

      <div className="mt-2">
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
            <YAxis tick={renderYAxisSalesQuantity} yAxisId="salesQuantity" />

            <Tooltip content={renderTooltip} />
            <Legend />

            <Area
              type="monotone"
              dataKey="salesQuantity"
              name="Sales Quantity"
              stroke="#73d13d"
              fillOpacity={0.5}
              fill="#73d13d"
              yAxisId="salesQuantity"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="text-center mt-1">
          <span className="font-semibold">
            Sales Quantity Total:
            <span className="ml-1">{totalByData.salesQuantity || 0}</span>
          </span>
        </div>
      </div>
    </>
  );
};
