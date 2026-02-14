namespace ProductItemsEnum {
  export enum SortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    releaseDate = "releaseDate",
    expirationDate = "expirationDate",
  }

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
