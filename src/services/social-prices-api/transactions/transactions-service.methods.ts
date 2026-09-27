"use client";

import { ITransaction } from "../../../shared/business/transactions/transaction.interface";
import {
  ITransactionSummary,
  ITransactionSummaryRequest,
} from "../../../shared/business/transactions/transactions.types";
import {
  ITableStateRequest,
  ITableStateResponse,
} from "../../../shared/utils/table/table-state.interface";
import ServiceMethodsBase from "../service-methods.base";
import CreateTransactionDto from "./dto/createTransaction.dto";
import TransactionsServiceEnum from "./transactions-service.enum";

export default class TransactionsServiceMethods extends ServiceMethodsBase {
  private _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: this.formatAuthorizationWithToken(),
    };
  }

  public async create(dto: CreateTransactionDto): Promise<ITransaction> {
    const response = await this._fetchAxios.post<ITransaction>(
      `${this._socialPricesApiV1}${TransactionsServiceEnum.Methods.CREATE}`,
      dto,
      { headers: this._headers() }
    );

    return response.data;
  }

  public async update(
    id: string,
    dto: CreateTransactionDto
  ): Promise<ITransaction> {
    const response = await this._fetchAxios.put<ITransaction>(
      `${this._socialPricesApiV1}${TransactionsServiceEnum.Methods.UPDATE.replace(":id", id)}`,
      dto,
      { headers: this._headers() }
    );

    return response.data;
  }

  public async remove(id: string): Promise<void> {
    await this._fetchAxios.delete<void>(
      `${this._socialPricesApiV1}${TransactionsServiceEnum.Methods.REMOVE.replace(":id", id)}`,
      { headers: this._headers() }
    );
  }

  public async findByUserTableState(
    tableState?: ITableStateRequest<ITransaction>
  ): Promise<ITableStateResponse<ITransaction[]>> {
    const response = await this._fetchAxios.post<
      ITableStateResponse<ITransaction[]>
    >(
      `${this._socialPricesApiV1}${TransactionsServiceEnum.Methods.FIND_BY_USER_TABLE_STATE}`,
      tableState,
      { headers: this._headers() }
    );

    return response.data;
  }

  public async summary(
    request: ITransactionSummaryRequest
  ): Promise<ITransactionSummary> {
    const response = await this._fetchAxios.post<ITransactionSummary>(
      `${this._socialPricesApiV1}${TransactionsServiceEnum.Methods.SUMMARY}`,
      request,
      { headers: this._headers() }
    );

    return response.data;
  }
}
