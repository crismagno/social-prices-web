namespace CommonEnum {
  export enum YesNo {
    YES = "YES",
    NO = "NO",
  }

  export const YesNoLabels = {
    [YesNo.YES]: "common.yes",
    [YesNo.NO]: "common.no",
  };

  export enum QuantityOrTotal {
    QUANTITY = "QUANTITY",
    TOTAL = "TOTAL",
  }

  export const QuantityOrTotalLabels = {
    [QuantityOrTotal.QUANTITY]: "common.quantity",
    [QuantityOrTotal.TOTAL]: "common.total",
  };
}

export default CommonEnum;
