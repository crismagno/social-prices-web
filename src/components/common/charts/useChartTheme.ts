import useAppData from "../../../data/context/app/useAppData";
import ThemeEnum from "../../../shared/common/enums/theme.enum";

export interface IChartTheme {
  /** Fixed categorical order — a series keeps its slot, it is never cycled. */
  series: string[];
  amount: string;
  salesQuantity: string;
  productQuantity: string;
  others: string;
  grid: string;
  axis: string;
  tick: string;
  surface: string;
  cursor: string;
}

const LIGHT_SERIES: string[] = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];

const DARK_SERIES: string[] = ["#3987e5", "#d95926", "#199e70", "#c98500"];

const LIGHT_THEME: IChartTheme = {
  series: LIGHT_SERIES,
  amount: LIGHT_SERIES[0],
  salesQuantity: LIGHT_SERIES[2],
  productQuantity: LIGHT_SERIES[1],
  others: "#b4b2ab",
  grid: "#ebeae5",
  axis: "#c3c2b7",
  tick: "#898781",
  surface: "#ffffff",
  cursor: "rgba(11, 11, 11, 0.05)",
};

const DARK_THEME: IChartTheme = {
  series: DARK_SERIES,
  amount: DARK_SERIES[0],
  salesQuantity: DARK_SERIES[2],
  productQuantity: DARK_SERIES[1],
  others: "#5f5e5a",
  grid: "#2c2c2a",
  axis: "#44443f",
  tick: "#898781",
  surface: "#1f2937",
  cursor: "rgba(255, 255, 255, 0.06)",
};

export const useChartTheme = (): IChartTheme => {
  const {
    theme: { theme },
  } = useAppData();

  return theme === ThemeEnum.Theme.DARK ? DARK_THEME : LIGHT_THEME;
};
