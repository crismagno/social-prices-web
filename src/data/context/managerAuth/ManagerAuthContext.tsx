"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IManager } from "../../../shared/business/managers/manager.interface";
import { IManagerAuthLogin } from "../../../shared/business/managers/managers.types";
import CookiesEnum from "../../../shared/common/cookies/cookies.enum";
import { localStorageMethodsInstance } from "../../../shared/common/local-storage/local-storage-methods";
import Urls from "../../../shared/common/routes-app/routes-app";

export interface IManagerAuthContext {
  manager: IManager | null;
  authToken: string | null;
  isLogged: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  validateSignInCode: (codeValue: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const ManagerAuthContext = createContext<IManagerAuthContext>({
  manager: null,
  authToken: null,
  isLogged: false,
  isLoading: true,
  login: async (): Promise<void> => {},
  validateSignInCode: async (): Promise<boolean> => false,
  logout: async (): Promise<void> => {},
});

const __managerCookie = (isLogged: boolean) => {
  if (isLogged) {
    Cookies.set(CookiesEnum.CookiesName.COOKIE_MANAGER_AUTH, `${isLogged}`, {
      expires: 30,
    });
  } else {
    Cookies.remove(CookiesEnum.CookiesName.COOKIE_MANAGER_AUTH);
  }
};

const __managerLocalStorage = (
  params: { manager: IManager; authToken: string } | null = null
) => {
  if (params?.manager) {
    localStorageMethodsInstance.localStorageManagerMethods.setManager(
      params.manager
    );
    localStorageMethodsInstance.localStorageManagerAuthTokenMethods.setManagerAuthToken(
      params.authToken
    );

    return;
  }

  localStorageMethodsInstance.localStorageManagerMethods.removeManager();
  localStorageMethodsInstance.localStorageManagerAuthTokenMethods.removeManagerAuthToken();
};

export const ManagerAuthProvider = ({ children }: { children?: any }) => {
  const [manager, setManager] = useState<IManager | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isLogged, setIsLogged] = useState<boolean>(false);

  const router = useRouter();

  const _settingSession = (
    params: { manager: IManager; authToken: string } | null = null
  ): void => {
    if (params?.manager?.email) {
      setManager(params.manager);
      setAuthToken(params.authToken);
      __managerCookie(true);
      __managerLocalStorage(params);
      setIsLogged(true);
      setIsLoading(false);

      return;
    }

    setManager(null);
    setAuthToken(null);
    __managerCookie(false);
    __managerLocalStorage();
    setIsLogged(false);
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      const response: IManagerAuthLogin =
        await serviceMethodsInstance.managerAuthServiceMethods.signIn(
          email,
          password
        );

      // A successful password step for someone ends any session already open in
      // this browser (cookie, stored token, isLogged). Otherwise the previous
      // manager's validated token would stay live behind the new manager's name
      // until the code is redeemed.
      _settingSession();

      // The token is deliberately NOT a session yet: the API refuses it everywhere
      // until the emailed code is redeemed. It lives in state only, like the user flow.
      setManager(response.manager);
      setAuthToken(response.authToken);

      router.push(Urls.MANAGER_VALIDATE_SIGN_IN_CODE);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignInCode = async (codeValue: string): Promise<boolean> => {
    try {
      if (!authToken) {
        router.push(Urls.MANAGER_LOGIN);

        return false;
      }

      setIsLoading(true);

      const response: IManagerAuthLogin | null =
        await serviceMethodsInstance.managerAuthServiceMethods.validateSignInCode(
          authToken,
          codeValue
        );

      if (!response) {
        return false;
      }

      _settingSession({
        manager: response.manager,
        authToken: response.authToken,
      });

      router.push(Urls.MANAGER_MANAGERS);

      return true;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      _settingSession();

      router.push(Urls.MANAGER_LOGIN);
    } catch (error: any) {
      handleClientError(error);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const _componentWillMount = useCallback(async () => {
    const hasNoCookie: boolean = !Cookies.get(
      CookiesEnum.CookiesName.COOKIE_MANAGER_AUTH
    );

    if (hasNoCookie) {
      _settingSession();

      return;
    }

    const tokenFromLocalStorage: string | null =
      localStorageMethodsInstance.localStorageManagerAuthTokenMethods.getManagerAuthToken();

    if (!tokenFromLocalStorage) {
      _settingSession();

      return;
    }

    try {
      const response: IManagerAuthLogin =
        await serviceMethodsInstance.managerAuthServiceMethods.getAuthManagerByToken(
          tokenFromLocalStorage
        );

      _settingSession({
        manager: response.manager,
        authToken: response.authToken,
      });
    } catch (error: any) {
      _settingSession();
    }
  }, []);

  useEffect(() => {
    _componentWillMount();
  }, [_componentWillMount]);

  return (
    <ManagerAuthContext.Provider
      value={{
        manager,
        authToken,
        isLogged,
        isLoading,
        login,
        validateSignInCode,
        logout,
      }}
    >
      {children}
    </ManagerAuthContext.Provider>
  );
};

export default ManagerAuthContext;
