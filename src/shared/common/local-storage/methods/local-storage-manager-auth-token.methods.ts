import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageManagerAuthTokenMethods {
  public getManagerAuthToken = (): string | null => {
    const item: string | null = localStorage.getItem(
      LocalStorageEnum.keys.MANAGER_AUTH_TOKEN
    );

    return item;
  };

  public setManagerAuthToken = (value: string): void => {
    localStorage.setItem(LocalStorageEnum.keys.MANAGER_AUTH_TOKEN, value);
  };

  public removeManagerAuthToken = (): void => {
    localStorage.removeItem(LocalStorageEnum.keys.MANAGER_AUTH_TOKEN);
  };
}
