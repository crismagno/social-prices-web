import React from "react";

import { Tag } from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { IGetSalesAnalyticsResponse } from "../../../../shared/business/sales/sales.type";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { SalesQuantityChartStatistic } from "../SalesChartsStatistics/SalesQuantityChartStatistic";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
  periodType: ChartsEnum.PeriodType;
}

export const SalesQuantityChartPeriodType: React.FC<Props> = ({
  salesAnalytics,
  periodType,
}) => {
  const { t } = useLanguageData();

  return (
    <SalesQuantityChartStatistic
      periodType={periodType}
      salesAnalytics={salesAnalytics}
      extra={
        <Tag className="m-0">{t(`sales.${periodType.toLowerCase()}`)}</Tag>
      }
    />
  );
};
