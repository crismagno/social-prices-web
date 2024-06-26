export type TTableStateSortOrder = "ascend" | "descend";

export interface ITableStateRequest<T> {
  search?: string;
  sort?: ITableStateRequestSort<T>;
  pagination?: ITableStateRequestPagination;
  filters?: any;
  action?: any;
  useConcat?: boolean;
}

export interface ITableStateRequestSort<T> {
  field?: keyof T;
  order?: TTableStateSortOrder;
}

export interface ITableStateRequestPagination {
  current?: number;
  pageSize?: number;
  total?: number;
  skip?: number;
}

export interface ITableStateResponse<T> {
  total: number;
  data: T;
}
