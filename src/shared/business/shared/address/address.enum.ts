namespace AddressEnum {
  export enum Type {
    SHIPPING = "SHIPPING",
    HOME = "HOME",
    NORMAL = "NORMAL",
    BUSINESS = "BUSINESS",
  }

  export const TypesLabels = {
    [Type.SHIPPING]: "address.shipping",
    [Type.HOME]: "address.home",
    [Type.NORMAL]: "address.normal",
    [Type.BUSINESS]: "address.business",
  };
}

export default AddressEnum;
