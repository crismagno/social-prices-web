"use client";

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default class FetchAxios {
  constructor() {}

  public async get(
    url: string,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = config
      ? config
      : {
          headers: {
            "Content-Type": "application/json",
          },
        };

    const response = await axios.get(url, config);

    return response;
  }

  public async post(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = config
      ? config
      : {
          headers: {
            "Content-Type": "application/json",
            // "Cross-Origin-Opener-Policy": "same-origin",
          },
        };

    const response = await axios.post(url, data, config);

    return response;
  }

  public async put(
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = config
      ? config
      : {
          headers: {
            "Content-Type": "application/json",
          },
        };

    const response = await axios.put(url, data, config);

    return response;
  }

  public async delete(
    url: string,
    config?: AxiosRequestConfig<any>
  ): Promise<AxiosResponse<any, any>> {
    config = config
      ? config
      : {
          headers: {
            "Content-Type": "application/json",
          },
        };

    const response = await axios.delete(url, config);

    return response;
  }
}
