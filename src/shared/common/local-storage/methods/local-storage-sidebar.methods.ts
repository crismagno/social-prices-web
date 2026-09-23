import LocalStorageEnum from "../local-storage.enum";

export default class LocalStorageSidebarMethods {
  public getIsCollapsed = (): boolean | null => {
    const isCollapsed: string | null = localStorage.getItem(
      LocalStorageEnum.keys.SIDEBAR_COLLAPSED
    );

    if (isCollapsed === null) {
      return null;
    }

    return isCollapsed === "true";
  };

  public setIsCollapsed = (isCollapsed: boolean): void => {
    localStorage.setItem(
      LocalStorageEnum.keys.SIDEBAR_COLLAPSED,
      String(isCollapsed)
    );
  };
}
