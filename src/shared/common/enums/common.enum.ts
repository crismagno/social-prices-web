namespace CommonEnum {
  export enum YesNo {
    YES = "YES",
    NO = "NO",
  }

  export const YesNoLabels = {
    [YesNo.YES]: "Yes",
    [YesNo.NO]: "No",
  };

  export enum QuantityOrTotal {
    QUANTITY = "QUANTITY",
    TOTAL = "TOTAL",
  }

  export const QuantityOrTotalLabels = {
    [QuantityOrTotal.QUANTITY]: "Quantity",
    [QuantityOrTotal.TOTAL]: "Total",
  };
}

export default CommonEnum;
