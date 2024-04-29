import { ITableStateRequest } from "./table-state.interface";

export const createTableState = <T>(
  params?: ITableStateRequest<T>
): ITableStateRequest<T> => {
  return {
    action: params?.action,
    filters: params?.filters,
    pagination: params?.pagination ?? {
      current: 1,
      pageSize: 10,
      total: 0,
      skip: undefined,
    },
    search: params?.search,
    sort: params?.sort,
  };
};
