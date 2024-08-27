import SalesEnum from "../../../shared/business/sales/sales.enum";
import { IRangeDate } from "../../../shared/common/interfaces/global";
import ChartsEnum from "../../../shared/utils/charts/charts-enum";
import { IChartDataPeriodTypeItem } from "../../../shared/utils/charts/charts-types";

export interface IGetSalesAnalyticsParams {
  storesIds?: string[];
  status?: SalesEnum.Status[];
  types?: SalesEnum.Type[];
  tagsIds?: string[];
  productIds?: string[];
  rangeDate?: IRangeDate;
  periodType?: ChartsEnum.PeriodType;
}

export interface IGetSalesAnalyticsResponse {
  chartDataPeriodType: IChartDataPeriodTypeItem[];
}
