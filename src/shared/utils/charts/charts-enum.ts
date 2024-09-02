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

  export const PeriodTypeShortLabel = {
    [PeriodType.HOUR]: "h",
    [PeriodType.DAY]: "d",
    [PeriodType.MONTH]: "m",
    [PeriodType.YEAR]: "y",
  };

  export const PeriodTypePropertyMoment = {
    [PeriodType.HOUR]: "hour",
    [PeriodType.DAY]: "day",
    [PeriodType.MONTH]: "month",
    [PeriodType.YEAR]: "year",
  };

  export const OthersName: string = "Others";

  export const DefaultItemsLength: number = 4;

  export const Colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#3FC734"];
}

export default ChartsEnum;
