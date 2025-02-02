"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import {
  Auth,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import handleClientError from "../../../components/common/handleClientError/handleClientError";
import firebaseApp from "../../../services/firebase/config";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  IAuthLogin,
  IAuthUserEmployee,
} from "../../../shared/business/auth/auth.types";
import { IEmployee } from "../../../shared/business/employees/employee.interface";
import PhoneNumberEnum from "../../../shared/business/enums/phone-number.enum";
import IUser from "../../../shared/business/users/user.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
import CookiesEnum from "../../../shared/common/cookies/cookies.enum";
import { localStorageMethodsInstance } from "../../../shared/common/local-storage/local-storage-methods";
import Urls from "../../../shared/common/routes-app/routes-app";
import {
  makeRandomCode,
  sleep,
} from "../../../shared/utils/functions/functions";

const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/contacts.readonly");

const auth: Auth = getAuth(firebaseApp);
auth.languageCode = "it";

export interface IAuthContext {
  user: IUser | null;
  employee: IEmployee | null;
  authToken: string | null;
  isLogged: boolean;
  isLoading: boolean;
  loginGoogle: () => Promise<void>;
  validateSignInCode: (codeValue: string) => Promise<boolean>;
  validateSignInEmployeeCode: (codeValue: string) => Promise<boolean>;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  loginEmployee: (username: string, password: string) => Promise<void>;
  create: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  setEmployee: (employee: IEmployee | null) => void;
  updateUserSession: (newUser: IUser | null) => void;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  employee: null,
  authToken: null,
  isLoading: true,
  isLogged: false,
  validateSignInCode: async (codeValue: string): Promise<any> => {},
  validateSignInEmployeeCode: async (codeValue: string): Promise<any> => {},
  setUser: (user: IUser | null): void => {},
  setEmployee: (employee: IEmployee | null): void => {},
  updateUserSession: (newUser: IUser | null): void => {},
  loginGoogle: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  login: async (): Promise<void> => {},
  loginEmployee: async (): Promise<void> => {},
  create: async (): Promise<void> => {},
});

const __normalizeUserFromFirebase = async (
  userFirebase: User
): Promise<IUser> => {
  const providerToken: string = await userFirebase.getIdToken();

  const now: Date = new Date();

  return {
    uid: userFirebase.uid,
    providerToken,
    username: userFirebase.displayName ?? null,
    email: userFirebase.email ?? null,
    avatar: userFirebase.photoURL,
    providerId: userFirebase.providerId,
    authProvider: UsersEnum.Provider.GOOGLE,
    extraDataProvider: null,
    phoneNumbers: userFirebase.phoneNumber
      ? [
          {
            type: PhoneNumberEnum.Type.OTHER,
            number: userFirebase.phoneNumber,
            uid: Date.now().toString(),
            messengers: [],
          },
        ]
      : [],
    status: null,
    addresses: [],
    birthDate: null,
    name: userFirebase.displayName,
    gender: null,
    loggedByAuthProvider: UsersEnum.Provider.GOOGLE,
    _id: userFirebase.uid,
    about: null,
    createdAt: now,
    updatedAt: now,
    type: UsersEnum.Type.COMPANY,
  };
};

const __managerCookie = (isLogged: boolean) => {
  if (isLogged) {
    Cookies.set(CookiesEnum.CookiesName.COOKIE_AUTH, `${isLogged}`, {
      expires: 30,
    });
  } else {
    Cookies.remove(CookiesEnum.CookiesName.COOKIE_AUTH);
  }
};

const __managerLocalStorage = (
  params: {
    user: IUser | null;
    employee: IEmployee | null;
    authToken: string | null;
  } | null = null
) => {
  if (params?.user) {
    localStorageMethodsInstance.localStorageUserMethods.setUser(params.user);
  } else {
    localStorageMethodsInstance.localStorageUserMethods.removeUser();
  }

  if (params?.employee) {
    localStorageMethodsInstance.localStorageEmployeeMethods.setEmployee(
      params.employee
    );
  } else {
    localStorageMethodsInstance.localStorageEmployeeMethods.removeEmployee();
  }

  if (params?.authToken) {
    localStorageMethodsInstance.localStorageAuthTokenMethods.setAuthToken(
      params.authToken
    );
  } else {
    localStorageMethodsInstance.localStorageAuthTokenMethods.removeAuthToken();
  }
};

const __mergeUserUpdated = (currentUser: IUser, newUser: IUser): IUser => {
  return {
    ...newUser,
    providerId: currentUser.providerId,
    providerToken: currentUser.providerToken,
    loggedByAuthProvider: currentUser.loggedByAuthProvider,
  };
};

export const AuthProvider = ({ children }: { children?: any }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [employee, setEmployee] = useState<IEmployee | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isLogged, setIsLogged] = useState<boolean>(false);

  const router = useRouter();

  const _settingSession = (
    params: {
      user: IUser | null;
      employee: IEmployee | null;
      authToken: string | null;
    } | null = null
  ): string | null => {
    if (params?.user?.email) {
      setUser(params.user);
      setEmployee(params.employee);
      setAuthToken(params.authToken);
      __managerCookie(true);
      __managerLocalStorage(params);
      setIsLoading(false);
      setIsLogged(true);

      return params.user.email;
    }

    setUser(null);
    setEmployee(null);
    setAuthToken(null);
    __managerCookie(false);
    __managerLocalStorage();
    setIsLoading(false);
    setIsLogged(false);

    return null;
  };

  const _validateToken = async (
    userParam: IUser,
    authTokenParam: string
  ): Promise<IUser | null> => {
    try {
      setIsLoading(true);

      if (!userParam || !authTokenParam) {
        _settingSession();
        return null;
      }

      const isValidToken: boolean =
        await serviceMethodsInstance.authServiceMethods.validateToken(
          authTokenParam
        );

      if (isValidToken) {
        const response: IAuthUserEmployee =
          await serviceMethodsInstance.authServiceMethods.getAuthUserEmployee();

        const newUser: IUser = __mergeUserUpdated(userParam, response.user);

        _settingSession({
          authToken:
            localStorageMethodsInstance.localStorageAuthTokenMethods.getAuthToken(),
          employee: response.employee,
          user: newUser,
        });

        return response.user;
      }

      _settingSession();

      if (userParam?.authProvider === UsersEnum.Provider.GOOGLE) {
        await signOut(auth);
      }

      router.push(Urls.LOGIN);

      return null;
    } catch (error: any) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const _settingSessionFirebase = async (
    userFirebase: User | null
  ): Promise<string | null | undefined> => {
    const userFromLocalStorage: IUser | null =
      localStorageMethodsInstance.localStorageUserMethods.getUser();

    const authTokenFromLocalStorage: string | null =
      localStorageMethodsInstance.localStorageAuthTokenMethods.getAuthToken();

    if (
      userFirebase?.email &&
      userFromLocalStorage &&
      authTokenFromLocalStorage
    ) {
      const userNormalized: IUser = await __normalizeUserFromFirebase(
        userFirebase
      );

      userFromLocalStorage.providerId = userNormalized.providerId;
      userFromLocalStorage.providerToken = userNormalized.providerToken;

      const userValidateToken: IUser | null = await _validateToken(
        userFromLocalStorage,
        authTokenFromLocalStorage
      );

      return userValidateToken?.email;
    }

    _settingSession();

    return null;
  };

  const _createOrSignInUserByLoginGoogle = async (userFirebase: User) => {
    const userNormalized: IUser = await __normalizeUserFromFirebase(
      userFirebase
    );

    const response: IAuthLogin =
      await serviceMethodsInstance.authServiceMethods.signUp({
        email: `${userNormalized.email}`,
        password: makeRandomCode(10),
        authProvider: userNormalized.authProvider,
        avatar: userNormalized.avatar,
        extraDataProvider: userNormalized.extraDataProvider,
        phoneNumbers: userNormalized.phoneNumbers ?? [],
        uid: userNormalized.uid,
        about: null,
        type: userNormalized.type,
      });

    response.user.providerId = userNormalized.providerId;
    response.user.providerToken = userNormalized.providerToken;
    response.user.loggedByAuthProvider = UsersEnum.Provider.GOOGLE;

    setUser(response.user);
    setEmployee(response.employee);
    setAuthToken(response.authToken);

    router.push(Urls.VALIDATE_SIGN_IN_CODE);

    setIsLoading(false);
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      await _createOrSignInUserByLoginGoogle(response.user);
    } catch (error: any) {
      setIsLoading(false);

      throw error;
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IAuthLogin =
        await serviceMethodsInstance.authServiceMethods.signIn(
          emailOrUsername,
          password
        );

      response.user.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

      setUser(response.user);
      setEmployee(response.employee);
      setAuthToken(response.authToken);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginEmployee = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IAuthLogin =
        await serviceMethodsInstance.authServiceMethods.signInEmployee(
          username,
          password
        );

      response.user.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

      setUser(response.user);
      setEmployee(response.employee);
      setAuthToken(response.authToken);

      router.push(Urls.VALIDATE_SIGN_IN_EMPLOYEE_CODE);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IAuthLogin =
        await serviceMethodsInstance.authServiceMethods.signUp({
          email: email,
          password,
          about: null,
          authProvider: null,
          avatar: null,
          extraDataProvider: null,
          phoneNumbers: [],
          uid: null,
          type: UsersEnum.Type.COMPANY,
        });

      response.user.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

      setUser(response.user);
      setEmployee(response.employee);
      setAuthToken(response.authToken);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      if (user?.loggedByAuthProvider === UsersEnum.Provider.GOOGLE) {
        await signOut(auth);
      }

      _settingSession();

      router.push(Urls.LOGIN);
    } catch (error: any) {
      handleClientError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignInCode = async (codeValue: string): Promise<boolean> => {
    try {
      if (!user || !authToken) {
        router.push(Urls.LOGIN);
        return false;
      }

      setIsLoading(true);

      const isValidateSignInCode: boolean =
        await serviceMethodsInstance.authServiceMethods.validateSignInCode(
          authToken,
          codeValue
        );

      if (!isValidateSignInCode) {
        return false;
      }

      const response: IAuthLogin =
        await serviceMethodsInstance.authServiceMethods.getAuthLoginByToken(
          authToken
        );

      const newUser: IUser = __mergeUserUpdated(user, response.user);

      _settingSession({
        authToken: response.authToken,
        employee: response.employee,
        user: newUser,
      });

      router.push(Urls.DASHBOARD);

      await sleep(5000);

      return true;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSession = (newUser: IUser | null) => {
    if (!newUser) {
      return;
    }

    if (!user) {
      _settingSession();
      return;
    }

    const userUpdated: IUser = __mergeUserUpdated(user, newUser);

    _settingSession({
      authToken:
        localStorageMethodsInstance.localStorageAuthTokenMethods.getAuthToken(),
      employee:
        localStorageMethodsInstance.localStorageEmployeeMethods.getEmployee(),
      user: userUpdated,
    });
  };

  const validateSignInEmployeeCode = async (
    codeValue: string
  ): Promise<boolean> => {
    try {
      if (!user || !authToken) {
        router.push(Urls.LOGIN_EMPLOYEE);
        return false;
      }

      setIsLoading(true);

      const isValidateSignInEmployeeCode: boolean =
        await serviceMethodsInstance.authServiceMethods.validateSignInEmployeeCode(
          authToken,
          codeValue
        );

      if (!isValidateSignInEmployeeCode) {
        return false;
      }

      const response: IAuthLogin =
        await serviceMethodsInstance.authServiceMethods.getAuthLoginByToken(
          authToken
        );

      const newUser: IUser = __mergeUserUpdated(user, response.user);

      _settingSession({
        authToken: response.authToken,
        employee: response.employee,
        user: newUser,
      });

      router.push(Urls.DASHBOARD);

      await sleep(5000);

      return true;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Method main to mount app data
   */
  const _componentWillMount = useCallback(async () => {
    const hasNoCookieAuth: boolean = !Cookies.get(
      CookiesEnum.CookiesName.COOKIE_AUTH
    );

    if (hasNoCookieAuth) {
      _settingSession();
      return;
    }

    const userFromLocalStorage: IUser | null =
      localStorageMethodsInstance.localStorageUserMethods.getUser();

    const authTokenFromLocalStorage: string | null =
      localStorageMethodsInstance.localStorageAuthTokenMethods.getAuthToken();

    if (!userFromLocalStorage || !authTokenFromLocalStorage) {
      _settingSession();
      return;
    }

    if (
      userFromLocalStorage?.loggedByAuthProvider === UsersEnum.Provider.GOOGLE
    ) {
      const cancel = auth.onIdTokenChanged(_settingSessionFirebase);

      return () => cancel();
    }

    await _validateToken(userFromLocalStorage, authTokenFromLocalStorage);
  }, []);

  useEffect(() => {
    _componentWillMount();
  }, [_componentWillMount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        authToken,
        isLogged,
        isLoading,
        loginGoogle,
        login,
        loginEmployee,
        create,
        logout,
        validateSignInCode,
        validateSignInEmployeeCode,
        setUser,
        updateUserSession,
        setEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
