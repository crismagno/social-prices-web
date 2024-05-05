namespace AddressEnum {
  export enum Types {
    SHIPPING = "SHIPPING",
    HOME = "HOME",
    NORMAL = "NORMAL",
  }

  export const TypesLabels = {
    [Types.SHIPPING]: "Shipping",
    [Types.HOME]: "Home",
    [Types.NORMAL]: "Normal",
  };
}

export default AddressEnum;
