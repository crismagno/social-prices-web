import React, { useState } from "react";

import { Button, Empty, Segmented, Tooltip as AntdTooltip } from "antd";
import { sumBy } from "lodash";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ShoppingCartOutlined } from "@ant-design/icons";

import { ChartPanel } from "../../../../components/common/charts/ChartPanel";
import { ChartTooltip } from "../../../../components/common/charts/ChartTooltip";
import { useChartTheme } from "../../../../components/common/charts/useChartTheme";
import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { IGetSalesAnalyticsResponse } from "../../../../shared/business/sales/sales.type";
import CommonEnum from "../../../../shared/common/enums/common.enum";
import Urls from "../../../../shared/common/routes-app/routes-app";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import {
  formatPercentage,
  getPercentage,
} from "../../../../shared/utils/charts/charts-format";
import { IChartDataProductItem } from "../../../../shared/utils/charts/charts-types";
import ImagesEnum from "../../../../shared/utils/images/images.enum";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
}

const DONUT_SIZE: number = 220;

export const SalesTopProducts: React.FC<Props> = ({ salesAnalytics }) => {
  const { t } = useLanguageData();

  const chartTheme = useChartTheme();

  const [quantityOrTotal, setQuantityOrTotal] =
    useState<CommonEnum.QuantityOrTotal>(CommonEnum.QuantityOrTotal.TOTAL);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isByTotal: boolean =
    quantityOrTotal === CommonEnum.QuantityOrTotal.TOTAL;

  const data: IChartDataProductItem[] =
    (isByTotal
      ? salesAnalytics?.chartDataProductsByTotal
      : salesAnalytics?.chartDataProductsByQuantity) ?? [];

  const dataKey: "total" | "quantity" = isByTotal ? "total" : "quantity";

  const total: number = sumBy(data, "total");

  const quantity: number = sumBy(data, "quantity");

  const sum: number = isByTotal ? total : quantity;

  const formatValue = (item: IChartDataProductItem): string =>
    isByTotal ? formatToMoneyDecimal(item.total ?? 0) : `${item.quantity ?? 0}`;

  // The colour belongs to the product's slot; "Others" is always neutral.
  const getColor = (item: IChartDataProductItem, index: number): string =>
    item.name === ChartsEnum.OthersName
      ? chartTheme.others
      : chartTheme.series[index] ?? chartTheme.others;

  const activeItem: IChartDataProductItem | null =
    activeIndex !== null ? data[activeIndex] ?? null : null;

  return (
    <ChartPanel
      title={t("sales.productsByHighestSalesRevenue")}
      extra={
        <Segmented<CommonEnum.QuantityOrTotal>
          size="small"
          value={quantityOrTotal}
          onChange={(value: CommonEnum.QuantityOrTotal) => {
            setActiveIndex(null);
            setQuantityOrTotal(value);
          }}
          options={[
            {
              label: t("common.total"),
              value: CommonEnum.QuantityOrTotal.TOTAL,
            },
            {
              label: t("common.quantity"),
              value: CommonEnum.QuantityOrTotal.QUANTITY,
            },
          ]}
        />
      }
    >
      {!data.length || !sum ? (
        <div className="flex items-center justify-center h-56">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <div
            className="relative shrink-0 mx-auto"
            style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={(props: any) => {
                    if (!props?.active || !props?.payload?.length) {
                      return null;
                    }

                    const item: IChartDataProductItem =
                      props.payload[0].payload;

                    return (
                      <ChartTooltip
                        title={item.name}
                        rows={[
                          {
                            label: t("common.total"),
                            value: formatToMoneyDecimal(item.total ?? 0),
                          },
                          {
                            label: t("sales.productQty"),
                            value: item.quantity ?? 0,
                          },
                          {
                            label: t("common.percentage"),
                            value: formatPercentage(item[dataKey] ?? 0, sum),
                          },
                        ]}
                      />
                    );
                  }}
                />

                <Pie
                  data={data}
                  dataKey={dataKey}
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={100}
                  paddingAngle={data.length > 1 ? 2 : 0}
                  cornerRadius={3}
                  stroke="none"
                  onMouseEnter={(_: any, index: number) =>
                    setActiveIndex(index)
                  }
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((item: IChartDataProductItem, index: number) => (
                    <Cell
                      key={`${item.productId}-${item.name}`}
                      fill={getColor(item, index)}
                      opacity={
                        activeIndex === null || activeIndex === index ? 1 : 0.35
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div
              className="absolute inset-0 flex flex-col items-center
                justify-center px-12 text-center pointer-events-none"
            >
              <span className="w-full text-xs truncate text-gray-500 dark:text-gray-400">
                {activeItem ? activeItem.name : t("common.total")}
              </span>

              <span className="text-lg font-semibold text-slate-800 dark:text-white">
                {activeItem
                  ? formatValue(activeItem)
                  : formatValue({ total, quantity } as IChartDataProductItem)}
              </span>
            </div>
          </div>

          <ul className="flex-1 min-w-64 m-0 p-0 list-none">
            {data.map((item: IChartDataProductItem, index: number) => {
              const color: string = getColor(item, index);

              const percentage: number = getPercentage(item[dataKey] ?? 0, sum);

              return (
                <li
                  key={`${item.productId}-${item.name}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2
                    transition-colors ${
                      activeIndex === index
                        ? "bg-gray-100 dark:bg-gray-700/60"
                        : ""
                    }`}
                >
                  <span
                    className="shrink-0 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />

                  <ImageOrDefault
                    src={item.mainUrl}
                    width={32}
                    className="rounded-md"
                    defaultImage={ImagesEnum.FilesNames.DefaultProductImage}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      {item.productId ? (
                        <Link
                          href={Urls.PRODUCT.replace(
                            ":productId",
                            item.productId
                          )}
                          className="text-sm truncate text-slate-800
                            hover:text-blue-500 dark:text-white"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="text-sm truncate text-slate-800 dark:text-white">
                          {item.name}
                        </span>
                      )}

                      <span
                        className="shrink-0 text-sm font-medium tabular-nums
                          text-slate-800 dark:text-white"
                      >
                        {formatValue(item)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden
                          bg-gray-100 dark:bg-gray-700"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>

                      <span className="w-12 text-right text-xs tabular-nums text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-0.5 text-xs text-gray-400">
                      {isByTotal
                        ? `${t("common.qty")}: ${item.quantity ?? 0}`
                        : `${t("common.total")}: ${formatToMoneyDecimal(
                            item.total ?? 0
                          )}`}
                    </div>
                  </div>

                  {item.productId ? (
                    <AntdTooltip title={t("sales.createSaleByProduct")}>
                      <Link
                        href={Urls.SALES_CREATE_BY_PRODUCT.replace(
                          ":productId",
                          item.productId
                        )}
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<ShoppingCartOutlined />}
                          aria-label={t("sales.createSaleByProduct")}
                        />
                      </Link>
                    </AntdTooltip>
                  ) : (
                    <span className="w-6" />
                  )}
                </li>
              );
            })}

            <li
              className="mt-2 flex items-center justify-between gap-3 px-2 pt-3
                border-t border-gray-200 dark:border-gray-700 text-sm"
            >
              <span className="text-gray-500 dark:text-gray-400">
                {t("common.total")}
              </span>

              <span className="font-semibold tabular-nums text-slate-800 dark:text-white">
                {formatToMoneyDecimal(total)}
                <span className="ml-2 font-normal text-gray-400">
                  {t("common.qty")}: {quantity}
                </span>
              </span>
            </li>
          </ul>
        </div>
      )}
    </ChartPanel>
  );
};
