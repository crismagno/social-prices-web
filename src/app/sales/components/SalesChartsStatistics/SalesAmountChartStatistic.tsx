import React, { ReactNode } from "react";

import { sumBy } from "lodash";

import { ChartPanel } from "../../../../components/common/charts/ChartPanel";
import { ChartTooltip } from "../../../../components/common/charts/ChartTooltip";
import { TrendChart } from "../../../../components/common/charts/TrendChart";
import { useChartTheme } from "../../../../components/common/charts/useChartTheme";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { IGetSalesAnalyticsResponse } from "../../../../shared/business/sales/sales.type";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import {
  formatCompactMoney,
  formatCompactNumber,
  formatPercentage,
} from "../../../../shared/utils/charts/charts-format";
import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";
import { getLocale } from "../../../../shared/utils/locales/locales";
import { formatToMoneyDecimal } from "../../../../shared/utils/strings/string";

interface Props {
  periodType: ChartsEnum.PeriodType;
  chartProps?: {
    height?: number | string;
  };
  title?: string;
  extra?: ReactNode;
  salesAnalytics?: IGetSalesAnalyticsResponse | null;
}

export const SalesAmountChartStatistic: React.FC<Props> = ({
  periodType,
  chartProps,
  title,
  extra,
  salesAnalytics,
}) => {
  const { t, language } = useLanguageData();

  const chartTheme = useChartTheme();

  const locale: string = getLocale(language);

  const data: IChartDataPeriodTypeItem[] =
    salesAnalytics?.chartDataPeriodType ?? [];

  const total: number = sumBy(data, "total");

  const quantity: number = sumBy(data, "quantity");

  const periodLabel: string = t(`sales.${periodType.toLowerCase()}`);

  return (
    <ChartPanel
      title={title ?? t("sales.salesRevenueByPeriod")}
      value={formatToMoneyDecimal(total)}
      caption={`${t("sales.productQuantity")}: ${quantity}`}
      extra={extra}
    >
      <TrendChart<IChartDataPeriodTypeItem>
        variant="area"
        data={data}
        dataKey="total"
        name={t("sales.totalAmount")}
        nameKey="name"
        secondary={{
          dataKey: "quantity",
          name: t("sales.productQuantity"),
          color: chartTheme.productQuantity,
          allowDecimals: false,
          formatYTick: (value: number) => formatCompactNumber(value, locale),
        }}
        color={chartTheme.amount}
        height={chartProps?.height ?? 320}
        formatXTick={(value: any) =>
          `${value}${ChartsEnum.PeriodTypeShortLabel[periodType]}`
        }
        formatYTick={(value: number) => formatCompactMoney(value, locale)}
        renderTooltip={(item: IChartDataPeriodTypeItem) => (
          <ChartTooltip
            title={`${periodLabel}: ${item.name}`}
            rows={[
              {
                label: t("sales.totalAmount"),
                value: formatToMoneyDecimal(item.total ?? 0),
                color: chartTheme.amount,
              },
              {
                label: t("common.percentage"),
                value: formatPercentage(item.total ?? 0, total),
              },
              {
                label: t("sales.productQuantity"),
                value: item.quantity ?? 0,
                color: chartTheme.productQuantity,
              },
              {
                label: t("common.percentage"),
                value: formatPercentage(item.quantity ?? 0, quantity),
              },
            ]}
          />
        )}
      />
    </ChartPanel>
  );
};
