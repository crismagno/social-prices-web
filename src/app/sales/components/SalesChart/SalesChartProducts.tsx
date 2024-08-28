import React, { useState } from "react";

import { Pie, PieChart, ResponsiveContainer, Sector } from "recharts";

import SelectByQuantityOrTotal from "../../../../components/common/SelectByQuantityOrTotal/SelectByQuantityOrTotal";
import { IGetSalesAnalyticsResponse } from "../../../../services/social-prices-api/sales/sales-service.types";
import CommonEnum from "../../../../shared/common/enums/common.enum";
import { IChartDataProductItem } from "../../../../shared/utils/charts/charts-types";
import { getImageUrl } from "../../../../shared/utils/images/url-images";
import { formatToMoneyDecimal } from "../../../../shared/utils/string-extensions/string-extensions";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
}

export const SalesChartProducts: React.FC<Props> = ({ salesAnalytics }) => {
  const [pieActiveIndex, setPieActiveIndex] = useState<number>(0);

  const [data, setData] = useState<IChartDataProductItem[]>(
    salesAnalytics?.chartDataProductsByTotal ?? []
  );

  const [quantityOrTotal, setQuantityOrTotal] =
    useState<CommonEnum.QuantityOrTotal>(CommonEnum.QuantityOrTotal.TOTAL);

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <image
          x={cx - 20}
          y={cy - 35}
          dy={8}
          width={40}
          height={40}
          href={getImageUrl(payload?.mainUrl)} // Replace with your image URL
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
        >
          {quantityOrTotal === CommonEnum.QuantityOrTotal.TOTAL
            ? `Total: ${formatToMoneyDecimal(value)}`
            : `Qty: ${value}`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
        >
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <>
      <SelectByQuantityOrTotal
        label="Products by Highest Sales Revenue: "
        onChange={(quantityOrTotal: CommonEnum.QuantityOrTotal) => {
          setQuantityOrTotal(quantityOrTotal);
          setData(
            quantityOrTotal === CommonEnum.QuantityOrTotal.TOTAL
              ? salesAnalytics?.chartDataProductsByTotal ?? []
              : salesAnalytics?.chartDataProductsByQuantity ?? []
          );
        }}
      />

      <ResponsiveContainer width="100%" height={370}>
        <PieChart width={400} height={400}>
          <Pie
            activeIndex={pieActiveIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="51%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            fill="#1677FE"
            dataKey={
              quantityOrTotal === CommonEnum.QuantityOrTotal.TOTAL
                ? "total"
                : "quantity"
            }
            onMouseEnter={(_, index) => setPieActiveIndex(index)}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};
