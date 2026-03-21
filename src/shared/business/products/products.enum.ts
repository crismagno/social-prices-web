namespace ProductsEnum {
  export enum SortField {
    releaseDate = "releaseDate",
    createdAt = "createdAt",
    expirationDate = "expirationDate",
    updatedAt = "updatedAt",
  }

  export const SortFieldLabels = {
    [SortField.releaseDate]: "products.releaseDate",
    [SortField.createdAt]: "sales.createdAt",
    [SortField.expirationDate]: "products.expirationDate",
    [SortField.updatedAt]: "sales.updatedAt",
  };
}

export default ProductsEnum;
