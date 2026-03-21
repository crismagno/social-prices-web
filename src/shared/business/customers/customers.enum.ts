namespace CustomersEnum {
  export enum SortField {
    birthDate = "birthDate",
    createdAt = "createdAt",
  }

  export const SortFieldLabels = {
    [SortField.birthDate]: "customers.birthDate",
    [SortField.createdAt]: "sales.createdAt",
  };
}

export default CustomersEnum;
