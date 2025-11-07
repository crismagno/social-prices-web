import CommonEnum from "../../common/enums/common.enum";
import { IRangeDate } from "../../common/interfaces/global.interface";
import ChartsEnum from "../../utils/charts/charts-enum";
import {
  IChartDataPeriodTypeItem,
  IChartDataProductItem,
} from "../../utils/charts/charts-types";
import { TTableStateSortOrder } from "../../utils/table/table-state.interface";
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
  customerIds?: string[];
  paymentStatus?: SalesEnum.PaymentStatus[];
  deliveryTypes?: SalesEnum.DeliveryType[];
}

export interface IGetSalesAnalyticsResponse {
  chartDataPeriodType: IChartDataPeriodTypeItem[];
  chartDataProductsByTotal: IChartDataProductItem[];
  chartDataProductsByQuantity: IChartDataProductItem[];
}

export interface IGetSalesBalanceParams {
  rangeDate?: IRangeDate;
  storeId?: string;
  customerId?: string;
  productIds?: string[];
}

export interface IGetSalesBalanceResponse {
  hour: IGetSalesBalanceTotalsResponse;
  day: IGetSalesBalanceTotalsResponse;
  month: IGetSalesBalanceTotalsResponse;
  annual: IGetSalesBalanceTotalsResponse;
}

export interface IGetSalesBalanceTotalsResponse {
  total: number;
  quantity: number;
  productsBalance: IGetSalesProductBalanceResponse[];
}

export interface IGetSalesProductBalanceResponse {
  product?: IProduct;
  total: number;
  quantity: number;
}

// #region Upload

export interface ISaleFileUploadTemplateRow {
  rowNumber: number;
  uniqName?: string;
  name?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  tags?: string;
  about?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string | number;
  address1?: string;
  address2?: string;
  district?: string;
  addressDescription?: string;
  addressTypes?: string;
  phoneType?: string;
  phoneNumber?: string | number;
  phoneMessengers?: string;
  selectedProducts?: string;
  discount?: string | number;
  shipping?: string | number;
  tax?: string | number;
  payments?: string;
  note?: string;
  saleStatus?: string;
  paymentStatus?: string;
  deliveryDate?: string;
  deliveryType?: string;
  createdDate?: string;
  saleNumberManual?: string;
}

export interface IFiltersDownloadSales {
  search: string | null;
  tagsIds: string[];
  types: SalesEnum.Type[];
  rangeCreatedDate: IRangeDate | null;
  selectedProductIds: string[];
  deliveryTypes: SalesEnum.DeliveryType[];
  status: SalesEnum.Status[];
  paymentStatus: SalesEnum.PaymentStatus[];
  storeIds: string[];
  customerIds: string[];
  sortField: SalesEnum.SortField;
  sortOrder: TTableStateSortOrder;
  isActive: CommonEnum.YesNo | null;
}

// #endregion

export interface IGetSalesSummaryByUserTableStateResponse {
  totalFinal: number;
  discount: number;
  tax: number;
  shipping: number;
  subtotal: number;
}

export interface ISendSaleSummaryLinkRequest {
  saleId: string;
  toEmail?: string;
}
