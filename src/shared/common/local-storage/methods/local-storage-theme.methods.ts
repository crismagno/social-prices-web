import ThemeEnum from "../../enums/theme.enum";
import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageThemeMethods {
  public static getTheme = (): ThemeEnum.Theme | null => {
    const selectedTheme: ThemeEnum.Theme | null = localStorage.getItem(
      LocalStorageEnum.keys.THEME
    ) as ThemeEnum.Theme | null;

    return selectedTheme;
  };

  public static setTheme = (theme: ThemeEnum.Theme): void => {
    localStorage.setItem(LocalStorageEnum.keys.THEME, theme);
  };
}
