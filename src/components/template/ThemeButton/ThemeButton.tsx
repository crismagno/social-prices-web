"use client";

import useAppData from "../../../data/hook/useAppData";
import ThemeEnum from "../../../shared/common/enums/theme.enum";
import { IconMoon, IconSun } from "../../elements/icons/icons";

interface Props {}

const ThemeButton: React.FC<Props> = ({}) => {
  const { changeTheme, theme } = useAppData();

  return (
    <button
      className={`flex justify-between items-center py-5 pl-1 pr-3 border rounded-full h-5 transition-all ${
        theme === ThemeEnum.Theme.DARK
          ? "text-white bg-gradient-to-r from-yellow-300 to-yellow-600"
          : "text-yellow-300 bg-gradient-to-r from-gray-300 to-gray-600"
      }`}
      onClick={changeTheme}
      title={
        theme === ThemeEnum.Theme.DARK
          ? "Set theme to light"
          : "Set theme to dark"
      }
    >
      <span
        className={`mr-3 shadow rounded-full p-1 transition-all ${
          theme === ThemeEnum.Theme.DARK
            ? "text-white bg-yellow-500"
            : "text-yellow-300 bg-blue-950"
        }`}
      >
        {theme === ThemeEnum.Theme.DARK ? IconSun : IconMoon}
      </span>
      <span>
        {theme === ThemeEnum.Theme.LIGHT
          ? ThemeEnum.ThemeLabels[ThemeEnum.Theme.DARK]
          : ThemeEnum.ThemeLabels[ThemeEnum.Theme.LIGHT]}
      </span>
    </button>
  );
};

export default ThemeButton;
