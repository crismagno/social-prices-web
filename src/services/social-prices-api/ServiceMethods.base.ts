"use client";

import FetchAxios from "../../shared/utils/fetch/fetch-axios";

export default abstract class ServiceMethodsBase {
  protected readonly _socialPricesApiV1: string;
  protected readonly _fetchAxios: FetchAxios;

  constructor() {
    this._socialPricesApiV1 = `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_API_URL_V1}`;
    this._fetchAxios = new FetchAxios();
  }
}
