"use client";

import {
  IWhatsappConnectConfig,
  IWhatsappConnection,
  IWhatsappSignupResult,
} from "../../../../shared/business/apps/whatsapp/whatsapp.types";
import ServiceMethodsBase from "../../service-methods.base";
import WhatsappServiceEnum from "./whatsapp-service.enum";

export default class WhatsappServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  private _url(path: string): string {
    return `${this._socialPricesApiV1}${path}`;
  }

  // What the browser needs to open Embedded Signup.
  public async getConnectConfig(): Promise<IWhatsappConnectConfig> {
    const response = await this._fetchAxios.get<IWhatsappConnectConfig>(
      this._url(WhatsappServiceEnum.Methods.CONNECT_CONFIG),
      { headers: this._headers() },
    );

    return response.data;
  }

  // Finishes the signup: the code and the ids Meta gave the browser.
  public async connect(
    result: IWhatsappSignupResult,
  ): Promise<IWhatsappConnection> {
    const response = await this._fetchAxios.post<IWhatsappConnection>(
      this._url(WhatsappServiceEnum.Methods.CONNECT),
      result,
      { headers: this._headers() },
    );

    return response.data;
  }

  public async getConnection(): Promise<IWhatsappConnection> {
    const response = await this._fetchAxios.get<IWhatsappConnection>(
      this._url(WhatsappServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );

    return response.data;
  }

  public async disconnect(): Promise<void> {
    await this._fetchAxios.delete(
      this._url(WhatsappServiceEnum.Methods.CONNECTION),
      { headers: this._headers() },
    );
  }
}
