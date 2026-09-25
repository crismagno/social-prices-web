import { useEffect, useState } from "react";

import { localStorageMethodsInstance } from "../../../shared/common/local-storage/local-storage-methods";

export interface IUseSidebarCollapsed {
  isCollapsed: boolean;
  // false until the stored choice was applied, so it doesn't animate on load.
  isTransitionEnabled: boolean;
  toggleIsCollapsed: () => void;
}

// The sidebar remounts on every page navigation; keeping the last value at
// module level lets it start in the right state instead of expanded.
let cachedIsCollapsed: boolean | null = null;

export const useSidebarCollapsed = (): IUseSidebarCollapsed => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    cachedIsCollapsed ?? false
  );
  const [isTransitionEnabled, setIsTransitionEnabled] =
    useState<boolean>(false);

  // localStorage is not available while rendering on the server, so the stored
  // choice can only be read after mounting.
  useEffect(() => {
    const storedIsCollapsed: boolean | null =
      localStorageMethodsInstance.localStorageSidebarMethods.getIsCollapsed();

    if (storedIsCollapsed !== null) {
      cachedIsCollapsed = storedIsCollapsed;
      setIsCollapsed(storedIsCollapsed);
    }

    const frameId: number = requestAnimationFrame(() =>
      setIsTransitionEnabled(true)
    );

    return () => cancelAnimationFrame(frameId);
  }, []);

  const toggleIsCollapsed = (): void => {
    setIsCollapsed((previousIsCollapsed: boolean) => {
      const nextIsCollapsed: boolean = !previousIsCollapsed;

      cachedIsCollapsed = nextIsCollapsed;

      localStorageMethodsInstance.localStorageSidebarMethods.setIsCollapsed(
        nextIsCollapsed
      );

      return nextIsCollapsed;
    });
  };

  return {
    isCollapsed,
    isTransitionEnabled,
    toggleIsCollapsed,
  };
};
