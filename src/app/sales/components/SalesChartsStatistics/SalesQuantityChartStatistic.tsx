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
  formatCompactNumber,
  formatPercentage,
} from "../../../../shared/utils/charts/charts-format";
import { IChartDataPeriodTypeItem } from "../../../../shared/utils/charts/charts-types";
import { getLocale } from "../../../../shared/utils/locales/locales";

interface Props {
  periodType: ChartsEnum.PeriodType;
  chartProps?: {
    height?: number | string;
  };
  title?: string;
  extra?: ReactNode;
  salesAnalytics?: IGetSalesAnalyticsResponse | null;
}

export const SalesQuantityChartStatistic: React.FC<Props> = ({
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

  const salesQuantity: number = sumBy(
    data,
    (item: IChartDataPeriodTypeItem) => item.salesQuantity || 0
  );

  const periodLabel: string = t(`sales.${periodType.toLowerCase()}`);

  return (
    <ChartPanel
      title={title ?? t("sales.salesQuantityByPeriod")}
      value={salesQuantity}
      extra={extra}
    >
      <TrendChart<IChartDataPeriodTypeItem>
        variant="bar"
        data={data}
        dataKey="salesQuantity"
        name={t("sales.salesQuantity")}
        nameKey="name"
        color={chartTheme.salesQuantity}
        height={chartProps?.height ?? 320}
        allowDecimals={false}
        formatXTick={(value: any) =>
          `${value}${ChartsEnum.PeriodTypeShortLabel[periodType]}`
        }
        formatYTick={(value: number) => formatCompactNumber(value, locale)}
        renderTooltip={(item: IChartDataPeriodTypeItem) => (
          <ChartTooltip
            title={`${periodLabel}: ${item.name}`}
            rows={[
              {
                label: t("sales.salesQuantity"),
                value: item.salesQuantity ?? 0,
                color: chartTheme.salesQuantity,
              },
              {
                label: t("common.percentage"),
                value: formatPercentage(item.salesQuantity ?? 0, salesQuantity),
              },
            ]}
          />
        )}
      />
    </ChartPanel>
  );
};
