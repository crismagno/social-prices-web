"use client";

import ServiceMethodsBase from "../service-methods.base";
import FeedbacksServiceEnum from "./feedbacks-service.enum";

export default class FeedbacksServiceMethods extends ServiceMethodsBase {
  public async create(message: string): Promise<void> {
    await this._fetchAxios.post<void>(
      `${this._socialPricesApiV1}${FeedbacksServiceEnum.Methods.CREATE}`,
      { message },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.formatAuthorizationWithToken(),
        },
      }
    );
  }
}
