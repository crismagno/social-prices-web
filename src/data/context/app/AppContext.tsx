"use client";

import { createContext } from "react";

import {
  IAppContextApps,
  useApps,
  useAppsDefaultValue,
} from "./hooks/apps/useApps";
import {
  IAppContextNotifications,
  useCountNotSeenNotificationsByUser,
  useCountNotSeenNotificationsByUserDefaultValue,
} from "./hooks/notifications/useCountNotSeenNotificationsByUser";
import {
  IAppContextTheme,
  useTheme,
  useThemeDefaultValue,
} from "./hooks/theme/useTheme";

interface IAppContext {
  theme: IAppContextTheme;
  notifications: IAppContextNotifications;
  apps: IAppContextApps;
}

const AppContext = createContext<IAppContext>({
  theme: useThemeDefaultValue,
  notifications: useCountNotSeenNotificationsByUserDefaultValue,
  apps: useAppsDefaultValue,
});

export function AppProvider({ children }: any) {
  return (
    <AppContext.Provider
      value={{
        theme: useTheme(),
        notifications: useCountNotSeenNotificationsByUser(),
        apps: useApps(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
