"use client";

import { createContext, useEffect, useState } from "react";

import ThemeEnum from "../../shared/common/enums/theme.enum";
import LocalStorageEnum from "../../shared/common/local-storage/local-storage.enum";

interface IAppContext {
  theme: ThemeEnum.Theme;
  changeTheme: () => void;
}

const AppContext = createContext<IAppContext>({
  theme: ThemeEnum.Theme.LIGHT,
  changeTheme: () => {},
});

export function AppProvider({ children }: any) {
  const [theme, setTheme] = useState<ThemeEnum.Theme>(ThemeEnum.Theme.LIGHT);

  const changeTheme = () => {
    const selectedTheme: ThemeEnum.Theme =
      theme === ThemeEnum.Theme.LIGHT
        ? ThemeEnum.Theme.DARK
        : ThemeEnum.Theme.LIGHT;

    setTheme(selectedTheme);

    localStorage.setItem(LocalStorageEnum.keys.THEME, selectedTheme);
  };

  useEffect(() => {
    const selectedTheme: ThemeEnum.Theme | null = localStorage.getItem(
      LocalStorageEnum.keys.THEME
    ) as ThemeEnum.Theme | null;

    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        changeTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
