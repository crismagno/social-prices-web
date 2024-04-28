import { useEffect, useState } from "react";

import ThemeEnum from "../../../../../shared/common/enums/theme.enum";
import LocalStorageThemeMethods from "../../../../../shared/common/local-storage/methods/local-storage-theme.methods";

export interface IAppContextTheme {
  theme: ThemeEnum.Theme;
  changeTheme: () => void;
}

export const useThemeDefaultValue: IAppContextTheme = {
  theme: ThemeEnum.Theme.LIGHT,
  changeTheme: () => {},
};

export const useTheme = (): IAppContextTheme => {
  const [theme, setTheme] = useState<ThemeEnum.Theme>(ThemeEnum.Theme.LIGHT);

  const changeTheme = () => {
    const selectedTheme: ThemeEnum.Theme =
      theme === ThemeEnum.Theme.LIGHT
        ? ThemeEnum.Theme.DARK
        : ThemeEnum.Theme.LIGHT;

    setTheme(selectedTheme);

    LocalStorageThemeMethods.setTheme(selectedTheme);
  };

  useEffect(() => {
    const selectedTheme: ThemeEnum.Theme | null =
      LocalStorageThemeMethods.getTheme();

    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  }, []);

  return {
    theme,
    changeTheme,
  };
};
