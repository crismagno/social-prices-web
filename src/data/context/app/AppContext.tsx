"use client";

import { createContext } from "react";

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
}

const AppContext = createContext<IAppContext>({
  theme: useThemeDefaultValue,
  notifications: useCountNotSeenNotificationsByUserDefaultValue,
});

export function AppProvider({ children }: any) {
  return (
    <AppContext.Provider
      value={{
        theme: useTheme(),
        notifications: useCountNotSeenNotificationsByUser(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
