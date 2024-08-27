namespace ChartsEnum {
  export enum PeriodType {
    HOUR = "HOUR",
    DAY = "DAY",
    MONTH = "MONTH",
    YEAR = "YEAR",
  }

  export const PeriodTypeLabel = {
    [PeriodType.HOUR]: "Hour",
    [PeriodType.DAY]: "Day",
    [PeriodType.MONTH]: "Month",
    [PeriodType.YEAR]: "Year",
  };

  export const OthersName: string = "Others";

  export const DefaultItemsLength: number = 5;
}

export default ChartsEnum;
