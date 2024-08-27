import React from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";

interface Props {
  data: IChartDataPeriodTypeItem[];
}

export const SalesChartPeriodType: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width={"100%"} height={370}>
      <AreaChart
        data={data}
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
        <Tooltip />
        <Area type="monotone" dataKey="total" stroke="#1677FE" fill="#1677FE" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
