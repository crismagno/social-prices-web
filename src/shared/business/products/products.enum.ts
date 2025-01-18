namespace ProductsEnum {
  export enum SortField {
    birthDate = "birthDate",
    createdAt = "createdAt",
  }

  export const SortFieldLabels = {
    [SortField.birthDate]: "Birth Date",
    [SortField.createdAt]: "Created At",
  };
}

export default ProductsEnum;
