import React from "react";

import { Select } from "antd";
import { map } from "lodash";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import { IGetSalesAnalyticsResponse } from "../../../../shared/business/sales/sales.type";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { SalesAmountChartStatistic } from "../SalesChartsStatistics/SalesAmountChartStatistic";

interface Props {
  salesAnalytics: IGetSalesAnalyticsResponse | null;
  onChange: (periodType: ChartsEnum.PeriodType) => void;
  periodType: ChartsEnum.PeriodType;
}

export const SalesChartPeriodType: React.FC<Props> = ({
  salesAnalytics,
  onChange,
  periodType,
}) => {
  const { t } = useLanguageData();

  return (
    <SalesAmountChartStatistic
      periodType={periodType}
      salesAnalytics={salesAnalytics}
      extra={
        <Select style={{ width: 120 }} value={periodType} onChange={onChange}>
          {map(
            Object.keys(ChartsEnum.PeriodType),
            (periodTypeParam: ChartsEnum.PeriodType) => (
              <Select.Option key={periodTypeParam} value={periodTypeParam}>
                {t(`sales.${periodTypeParam.toLowerCase()}`)}
              </Select.Option>
            )
          )}
        </Select>
      }
    />
  );
};
