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

  public async get(
    url: string,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = this._getConfig(config);

    const response = await axios.get(url, config);

    return response;
  }

  public async post(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = this._getConfig(config);

    const response = await axios.post(url, data, config);

    return response;
  }

  public async put(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = this._getConfig(config);

    const response = await axios.put(url, data, config);

    return response;
  }

  public async delete(
    url: string,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = this._getConfig(config);

    const response = await axios.delete(url, config);

    return response;
  }

  //#endregion

  //#region Private Methods

  private _getConfig(
    config?: AxiosRequestConfig<any>
  ): AxiosRequestConfig<any> {
    return (config = config ? config : this._defaultConfig);
  }

  //#endregion
}
