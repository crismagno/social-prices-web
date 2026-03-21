import { IconMoon, IconSun } from "../../../components/common/icons/icons";

namespace ThemeEnum {
  export enum Theme {
    LIGHT = "light",
    DARK = "dark",
  }

  export const ThemeLabels = {
    [Theme.LIGHT]: "common.light",
    [Theme.DARK]: "common.dark",
  };

  export const ThemeIcons = {
    [Theme.LIGHT]: IconMoon,
    [Theme.DARK]: IconSun,
  };
}

export default ThemeEnum;
