"use client";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default class FetchAxios {
  //#region Private Properties

  private _defaultConfig: AxiosRequestConfig<any>;

  //#endregion

  //#region Constructors

  constructor() {
    this._defaultConfig = {
      headers: {
        "Content-Type": "application/json",
        // "Cross-Origin-Opener-Policy": "same-origin",
      },
    };
  }

  //#endregion

  //#region Public Methods

  public async get<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T, D>> {
    config = this._getConfig<D>(config);

    const response: AxiosResponse<T, D> = await axios.get<T>(url, config);

    return response;
  }

  public async post<T = any, D = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T, D>> {
    config = this._getConfig<D>(config);

    const response: AxiosResponse<T, D> = await axios.post<T>(
      url,
      data,
      config
    );

    return response;
  }

  public async put<T = any, D = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T, D>> {
    config = this._getConfig<D>(config);

    const response: AxiosResponse<T, D> = await axios.put<T>(url, data, config);

    return response;
  }

  public async delete<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T, D>> {
    config = this._getConfig(config);

    const response: AxiosResponse<T, D> = await axios.delete<T>(url, config);

    return response;
  }

  //#endregion

  //#region Private Methods

  private _getConfig<D = any>(
    config?: AxiosRequestConfig<D>
  ): AxiosRequestConfig<D> {
    return (config = config ? config : this._defaultConfig);
  }

  //#endregion
}
