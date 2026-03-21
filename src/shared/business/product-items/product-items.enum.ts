namespace ProductItemsEnum {
  export enum SortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    releaseDate = "releaseDate",
    expirationDate = "expirationDate",
    name = "name",
    price = "price",
    quantity = "quantity",
  }

  export const SortFieldLabels = {
    [SortField.createdAt]: "productItems.createdAt",
    [SortField.updatedAt]: "productItems.updatedAt",
    [SortField.releaseDate]: "productItems.releaseDate",
    [SortField.expirationDate]: "productItems.expirationDate",
    [SortField.name]: "common.name",
    [SortField.price]: "common.price",
    [SortField.quantity]: "common.quantity",
  };

  export const SelectOptionsRangeDatePicker: {
    label: string;
    value: SortField;
  }[] = [
    { label: SortFieldLabels[SortField.createdAt], value: SortField.createdAt },
    { label: SortFieldLabels[SortField.updatedAt], value: SortField.updatedAt },
    { label: SortFieldLabels[SortField.releaseDate], value: SortField.releaseDate },
    { label: SortFieldLabels[SortField.expirationDate], value: SortField.expirationDate },
  ];
}

export default ProductItemsEnum;
