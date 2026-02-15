namespace ProductsEnum {
  export enum SortField {
    releaseDate = "releaseDate",
    createdAt = "createdAt",
    expirationDate = "expirationDate",
    updatedAt = "updatedAt",
  }

  export const SortFieldLabels = {
    [SortField.releaseDate]: "Release Date",
    [SortField.createdAt]: "Created At",
    [SortField.expirationDate]: "Expiration Date",
    [SortField.updatedAt]: "Updated At",
  };
}

export default ProductsEnum;
