"use client";

import { createContext, useEffect, useState } from "react";

import ThemeEnum from "../../shared/common/enums/theme.enum";
import LocalStorageThemeMethods from "../../shared/common/local-storage/methods/local-storage-theme.methods";

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

    LocalStorageThemeMethods.setTheme(selectedTheme);
  };

  useEffect(() => {
    const selectedTheme: ThemeEnum.Theme | null =
      LocalStorageThemeMethods.getTheme();

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
