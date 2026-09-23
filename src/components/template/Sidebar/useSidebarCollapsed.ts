import { useEffect, useState } from "react";

import { localStorageMethodsInstance } from "../../../shared/common/local-storage/local-storage-methods";

export interface IUseSidebarCollapsed {
  isCollapsed: boolean;
  toggleIsCollapsed: () => void;
}

export const useSidebarCollapsed = (): IUseSidebarCollapsed => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // localStorage is not available while rendering on the server, so the stored
  // choice can only be read after mounting.
  useEffect(() => {
    const storedIsCollapsed: boolean | null =
      localStorageMethodsInstance.localStorageSidebarMethods.getIsCollapsed();

    if (storedIsCollapsed !== null) {
      setIsCollapsed(storedIsCollapsed);
    }
  }, []);

  const toggleIsCollapsed = (): void => {
    setIsCollapsed((previousIsCollapsed: boolean) => {
      const nextIsCollapsed: boolean = !previousIsCollapsed;

      localStorageMethodsInstance.localStorageSidebarMethods.setIsCollapsed(
        nextIsCollapsed
      );

      return nextIsCollapsed;
    });
  };

  return {
    isCollapsed,
    toggleIsCollapsed,
  };
};
