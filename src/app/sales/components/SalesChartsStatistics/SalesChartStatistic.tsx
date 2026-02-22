import React, { useState } from "react";

import Loading from "../../../../components/common/Loading/Loading";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { IGetSalesAnalyticsParams } from "../../../../shared/business/sales/sales.type";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { useGetSalesAnalytics } from "../../useGetSalesAnalytics";
import { SalesAmountChartStatistic } from "./SalesAmountChartStatistic";
import { SalesQuantityChartStatistic } from "./SalesQuantityChartStatistic";

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
  customerId?: string;
  employeeId?: string;
  isSalesQuantityMode?: boolean;
}

export const SalesChartStatistic: React.FC<Props> = ({
  periodType,
  chartProps,
  title,
  rangeDate,
  storeId,
  customerId,
  employeeId,
  isSalesQuantityMode,
}) => {
  const [getSalesAnalyticsParams] = useState<IGetSalesAnalyticsParams>({
    periodType,
    rangeDate,
    storesIds: storeId ? [storeId] : undefined,
    customerIds: customerId ? [customerId] : undefined,
    employeeIds: employeeId ? [employeeId] : undefined,
    status: SalesEnum.StatusToFilterCharts,
  });

  const { isLoading, salesAnalytics } = useGetSalesAnalytics(
    getSalesAnalyticsParams
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isSalesQuantityMode) {
    return (
      <SalesQuantityChartStatistic
        periodType={periodType}
        chartProps={chartProps}
        title={title}
        salesAnalytics={salesAnalytics}
      />
    );
  }

  return (
    <SalesAmountChartStatistic
      periodType={periodType}
      chartProps={chartProps}
      title={title}
      salesAnalytics={salesAnalytics}
    />
  );
};
