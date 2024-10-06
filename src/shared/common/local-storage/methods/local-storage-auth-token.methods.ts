import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageAuthTokenMethods {
  public static getAuthToken = (): string | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.AUTH_TOKEN
    );

    return item;
  };

  public static setAuthToken = (value: string): void => {
    localStorage.setItem(LocalStorageEnum.keys.AUTH_TOKEN, value);
  };

  public static removeAuthToken = (): void => {
    localStorage.removeItem(LocalStorageEnum.keys.AUTH_TOKEN);
  };
}
