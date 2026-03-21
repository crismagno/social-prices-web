"use client";

import { Tooltip } from "antd";

import useAppData from "../../../data/context/app/useAppData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import ThemeEnum from "../../../shared/common/enums/theme.enum";

const ThemeButton: React.FC = () => {
  const {
    theme: { changeTheme, theme },
  } = useAppData();
  const { t } = useLanguageData();

  return (
    <Tooltip
      title={
        theme === ThemeEnum.Theme.DARK
          ? t("settings.setThemeLight")
          : t("settings.setThemeDark")
      }
    >
      <button
        className={`flex justify-between items-center py-5 pl-1 pr-3 border rounded-full h-5 transition-all ${
          theme === ThemeEnum.Theme.DARK
            ? "text-white bg-gradient-to-r from-yellow-300 to-yellow-600"
            : "text-yellow-300 bg-gradient-to-r from-gray-300 to-gray-600"
        }`}
        onClick={changeTheme}
        title={
          theme === ThemeEnum.Theme.DARK
            ? t("settings.setThemeLight")
            : t("settings.setThemeDark")
        }
      >
        <span
          className={`mr-3 shadow rounded-full p-1 transition-all ${
            theme === ThemeEnum.Theme.DARK
              ? "text-white bg-yellow-500"
              : "text-yellow-300 bg-blue-950"
          }`}
        >
          {ThemeEnum.ThemeIcons[theme]}
        </span>
        <span>
          {theme === ThemeEnum.Theme.LIGHT
            ? t(ThemeEnum.ThemeLabels[ThemeEnum.Theme.DARK])
            : t(ThemeEnum.ThemeLabels[ThemeEnum.Theme.LIGHT])}
        </span>
      </button>
    </Tooltip>
  );
};

export default ThemeButton;
