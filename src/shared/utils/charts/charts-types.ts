export interface IChartDateTotalItem {
  total: number;
  date: Date;
}

export interface IChartDataPeriodTypeItem {
  total: number;
  name: any;
  quantity: number;
}

export interface IChartDataProductItem {
  total: number;
  name: any;
  productId: string;
  mainUrl?: string;
  quantity: number;
}
