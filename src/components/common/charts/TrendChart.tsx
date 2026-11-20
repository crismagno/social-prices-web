import React, { ReactNode, useId } from "react";

import { Empty } from "antd";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "./useChartTheme";

export interface ITrendChartSecondarySeries<T> {
  dataKey: keyof T & string;
  name: string;
  color: string;
  allowDecimals?: boolean;
  formatYTick?: (value: number) => string;
}

interface Props<T> {
  data: T[];
  dataKey: keyof T & string;
  /** Series name shown in the legend. */
  name: string;
  /** Second line, measured on its own axis on the right. */
  secondary?: ITrendChartSecondarySeries<T>;
  nameKey: keyof T & string;
  variant: "area" | "bar";
  color: string;
  height?: number | string;
  allowDecimals?: boolean;
  formatXTick?: (value: any) => string;
  formatYTick?: (value: number) => string;
  renderTooltip: (item: T) => ReactNode;
}

const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };

const DENSE_AXIS_LENGTH: number = 16;

const PRIMARY_AXIS_ID: string = "primary";

const SECONDARY_AXIS_ID: string = "secondary";

export const TrendChart = <T extends object>({
  data,
  dataKey,
  name,
  secondary,
  nameKey,
  variant,
  color,
  height = 300,
  allowDecimals = true,
  formatXTick,
  formatYTick,
  renderTooltip,
}: Props<T>) => {
  const chartTheme = useChartTheme();

  const gradientId: string = `trend-${useId().replace(/:/g, "")}`;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  const tickStyle = { fontSize: 11, fill: chartTheme.tick };

  const axisLine = { stroke: chartTheme.axis };

  const isDense: boolean = data.length > DENSE_AXIS_LENGTH;

  const renderXTick = (tickProps: any): React.ReactElement => {
    const { x, y, payload } = tickProps;

    return (
      <text
        x={x}
        y={y + 14}
        textAnchor="middle"
        fontSize={isDense ? 9 : 11}
        fill={chartTheme.tick}
      >
        {formatXTick ? formatXTick(payload.value) : payload.value}
      </text>
    );
  };

  // Recharts only picks up axes, grid and legend when they are direct
  // children of the chart, so they are shared as a keyed list, not a fragment.
  const axes: React.ReactElement[] = [
    <CartesianGrid key="grid" strokeDasharray="3 3" stroke={chartTheme.grid} />,
    <XAxis
      key="x"
      dataKey={nameKey}
      tick={renderXTick}
      tickLine={axisLine}
      height={30}
      axisLine={axisLine}
      interval={0}
    />,
    <YAxis
      key="y-primary"
      yAxisId={PRIMARY_AXIS_ID}
      width={60}
      tick={tickStyle}
      tickLine={axisLine}
      axisLine={axisLine}
      allowDecimals={allowDecimals}
      tickFormatter={formatYTick}
    />,
    ...(secondary
      ? [
          <YAxis
            key="y-secondary"
            yAxisId={SECONDARY_AXIS_ID}
            orientation="right"
            width={40}
            tick={tickStyle}
            tickLine={axisLine}
            axisLine={axisLine}
            allowDecimals={secondary.allowDecimals ?? true}
            tickFormatter={secondary.formatYTick}
          />,
        ]
      : []),
    <Legend
      key="legend"
      iconType="circle"
      iconSize={8}
      wrapperStyle={{ fontSize: 12 }}
      formatter={(value: string) => (
        <span style={{ color: chartTheme.tick }}>{value}</span>
      )}
    />,
  ];

  const renderTooltipContent = (props: any): ReactNode => {
    if (!props?.active || !props?.payload?.length) {
      return null;
    }

    return renderTooltip(props.payload[0].payload as T);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === "bar" ? (
        <BarChart data={data} margin={CHART_MARGIN}>
          {axes}

          <Tooltip
            content={renderTooltipContent}
            cursor={{ fill: chartTheme.cursor }}
          />

          <Bar
            yAxisId={PRIMARY_AXIS_ID}
            dataKey={dataKey}
            name={name}
            fill={color}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      ) : (
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {axes}

          <Tooltip
            content={renderTooltipContent}
            cursor={{ stroke: chartTheme.axis, strokeWidth: 1 }}
          />

          <Area
            yAxisId={PRIMARY_AXIS_ID}
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={
              data.length === 1
                ? { r: 4, fill: color, stroke: chartTheme.surface }
                : false
            }
            activeDot={{
              r: 4,
              fill: color,
              stroke: chartTheme.surface,
              strokeWidth: 2,
            }}
          />

          {secondary && (
            <Area
              yAxisId={SECONDARY_AXIS_ID}
              type="monotone"
              dataKey={secondary.dataKey}
              name={secondary.name}
              stroke={secondary.color}
              strokeWidth={2}
              fill="none"
              dot={
                data.length === 1
                  ? { r: 4, fill: secondary.color, stroke: chartTheme.surface }
                  : false
              }
              activeDot={{
                r: 4,
                fill: secondary.color,
                stroke: chartTheme.surface,
                strokeWidth: 2,
              }}
            />
          )}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};
