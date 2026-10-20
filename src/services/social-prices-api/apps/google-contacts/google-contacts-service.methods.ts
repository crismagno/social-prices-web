"use client";

import {
  IGoogleContactsConnection,
  IGoogleContactsImportResponse,
  IGoogleContactsPreview,
} from "../../../../shared/business/apps/google-contacts/google-contacts.types";
import ServiceMethodsBase from "../../service-methods.base";
import GoogleContactsServiceEnum from "./google-contacts-service.enum";

export default class GoogleContactsServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  public async getConnection(): Promise<IGoogleContactsConnection> {
    const response = await this._fetchAxios.get<IGoogleContactsConnection>(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.CONNECTION}`,
      { headers: this._headers() },
    );

    return response.data;
  }

  public async connect(): Promise<{ url: string }> {
    const response = await this._fetchAxios.post<{ url: string }>(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.CONNECT}`,
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  // Lists the Google contacts and where each stands; saves nothing.
  public async listContacts(): Promise<IGoogleContactsPreview> {
    const response = await this._fetchAxios.post<IGoogleContactsPreview>(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.LIST_CONTACTS}`,
      {},
      { headers: this._headers() },
    );

    return response.data;
  }

  public async importContacts(
    externalIds: string[],
  ): Promise<IGoogleContactsImportResponse> {
    const response = await this._fetchAxios.post<IGoogleContactsImportResponse>(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.IMPORT}`,
      { externalIds },
      { headers: this._headers() },
    );

    return response.data;
  }

  // By hand: ties one contact to a customer the user picked.
  public async linkContact(
    externalId: string,
    customerId: string,
  ): Promise<{ customerId: string; customerName: string | null }> {
    const response = await this._fetchAxios.post<{
      customerId: string;
      customerName: string | null;
    }>(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.LINK}`,
      { externalId, customerId },
      { headers: this._headers() },
    );

    return response.data;
  }

  // Which customer holds a contact: for a list cached before that was known.
  public async findCustomer(
    externalId: string,
  ): Promise<{ customerId: string | null }> {
    const response = await this._fetchAxios.post<{
      customerId: string | null;
    }>(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.FIND_CUSTOMER}`,
      { externalId },
      { headers: this._headers() },
    );

    return response.data;
  }

  public async disconnect(): Promise<void> {
    await this._fetchAxios.delete(
      `${this._socialPricesApiV1}${GoogleContactsServiceEnum.Methods.DISCONNECT}`,
      { headers: this._headers() },
    );
  }
}
