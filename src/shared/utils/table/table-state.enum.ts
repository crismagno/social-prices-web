namespace TableStateEnum {
  export enum SortOrder {
    ascend = "ascend",
    descend = "descend",
  }

  export const SortOrderLabels = {
    [SortOrder.ascend]: "Ascend",
    [SortOrder.descend]: "Descend",
  };
}

export default TableStateEnum;
