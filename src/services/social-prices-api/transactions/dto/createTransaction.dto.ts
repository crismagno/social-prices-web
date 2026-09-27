import TransactionsEnum from "../../../../shared/business/transactions/transactions.enum";

export default interface CreateTransactionDto {
  name: string;
  type: TransactionsEnum.Type;
  value: number;
  status: TransactionsEnum.Status;
  note: string | null;
  tagsIds: string[];
  categoriesIds: string[];
  storeIds: string[];
  createdDate: string | null;
}
