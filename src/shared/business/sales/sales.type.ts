import { IRangeDate } from "../../common/interfaces/global.interface";
import ChartsEnum from "../../utils/charts/charts-enum";
import {
  IChartDataPeriodTypeItem,
  IChartDataProductItem,
} from "../../utils/charts/charts-types";
import { IProduct } from "../products/products.interface";
import SalesEnum from "./sales.enum";

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
  chartDataProductsByTotal: IChartDataProductItem[];
  chartDataProductsByQuantity: IChartDataProductItem[];
}

export interface IGetSalesBalanceParams {
  rangeDate?: IRangeDate;
}

export interface IGetSalesBalanceResponse {
  lastHour: IGetSalesBalanceTotalsResponse;
  day: IGetSalesBalanceTotalsResponse;
  month: IGetSalesBalanceTotalsResponse;
  annual: IGetSalesBalanceTotalsResponse;
}

export interface IGetSalesBalanceTotalsResponse {
  total: number;
  quantity: number;
  product?: IProduct;
  productTotal: number;
  productQuantity: number;
}
