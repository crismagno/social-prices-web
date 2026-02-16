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
    [SortField.createdAt]: "Created At",
    [SortField.updatedAt]: "Updated At",
    [SortField.releaseDate]: "Release Date",
    [SortField.expirationDate]: "Expiration Date",
    [SortField.name]: "Name",
    [SortField.price]: "Price",
    [SortField.quantity]: "Quantity",
  };

  export const SelectOptionsRangeDatePicker: {
    label: string;
    value: SortField;
  }[] = [
    { label: "Created At", value: SortField.createdAt },
    { label: "Updated At", value: SortField.updatedAt },
    { label: "Release Date", value: SortField.releaseDate },
    { label: "Expiration Date", value: SortField.expirationDate },
  ];
}

export default ProductItemsEnum;
