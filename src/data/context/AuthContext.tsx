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

import handleClientError from "../../components/common/handleClientError/handleClientError";
import firebaseApp from "../../services/firebase/config";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import IUser from "../../shared/business/users/user.interface";
import UsersEnum from "../../shared/business/users/users.enum";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import LocalStorageEnum from "../../shared/common/local-storage/local-storage.enum";
import LocalStorageUserMethods from "../../shared/common/local-storage/methods/local-storage-user.methods";
import Urls from "../../shared/common/routes-app/routes-app";

const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
const auth: Auth = getAuth(firebaseApp);

export interface IAuthContext {
  user: IUser | null;
  isLoading: boolean;
  loginGoogle: () => Promise<void>;
  validateSignInCode: (codeValue: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<void>;
  create: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  updateUserSession: (newUser: IUser | null) => void;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoading: true,
  validateSignInCode: async (codeValue: string): Promise<any> => {},
  setUser: (user: IUser | null): void => {},
  updateUserSession: (newUser: IUser | null): void => {},
  loginGoogle: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  login: async (): Promise<void> => {},
  create: async (): Promise<void> => {},
});

const __normalizeUser = async (userFirebase: User): Promise<IUser> => {
  const providerToken: string = await userFirebase.getIdToken();

  return {
    uid: userFirebase.uid,
    providerToken,
    username: userFirebase.displayName ?? null,
    email: userFirebase.email ?? null,
    avatar: userFirebase.photoURL,
    providerId: userFirebase.providerId,
    authProvider: UsersEnum.Provider.GOOGLE,
    authToken: null,
    extraDataProvider: null,
    phoneNumbers: userFirebase.phoneNumber
      ? [
          {
            type: UsersEnum.PhoneTypes.OTHER,
            number: userFirebase.phoneNumber,
            uid: Date.now().toString(),
          },
        ]
      : null,
    status: null,
    addresses: [],
    birthDate: null,
    firstName: userFirebase.displayName,
    lastName: null,
    middleName: null,
    gender: null,
    loggedByAuthProvider: UsersEnum.Provider.GOOGLE,
    _id: userFirebase.uid,
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

const __managerLocalStorage = (user: IUser | null) => {
  if (user) {
    localStorage.setItem(LocalStorageEnum.keys.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LocalStorageEnum.keys.USER);
  }
};

const __mergeUserUpdated = (currentUser: IUser, newUser: IUser): IUser => {
  return {
    ...newUser,
    providerId: currentUser.providerId,
    providerToken: currentUser.providerToken,
    loggedByAuthProvider: currentUser.loggedByAuthProvider,
    authToken:
      newUser.authToken && newUser.authToken !== currentUser.authToken
        ? newUser.authToken
        : currentUser.authToken,
  };
};

export const AuthProvider = ({ children }: { children?: any }) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const _settingSession = (user: IUser | null) => {
    if (user?.email) {
      setUser(user);
      __managerCookie(true);
      __managerLocalStorage(user);
      setIsLoading(false);
      return user.email;
    }

    setUser(null);
    __managerCookie(false);
    __managerLocalStorage(null);
    setIsLoading(false);
    return null;
  };

  const _validateToken = async (userParam: IUser): Promise<IUser | null> => {
    try {
      setIsLoading(true);

      if (!userParam.authToken) {
        _settingSession(null);
        return null;
      }

      const isValidToken: boolean =
        await serviceMethodsInstance.authServiceMethods.validateToken(
          userParam.authToken
        );

      if (isValidToken) {
        const userResponse: IUser =
          await serviceMethodsInstance.usersServiceMethods.getUser();

        const newUser: IUser = __mergeUserUpdated(userParam, userResponse);

        _settingSession(newUser);
        return newUser;
      }

      _settingSession(null);

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

  const _settingSessionFirebase = async (userFirebase: User | null) => {
    const userFromLocalStorage: IUser | null =
      LocalStorageUserMethods.getUser();

    if (userFirebase?.email && userFromLocalStorage) {
      const userNormalized: IUser = await __normalizeUser(userFirebase);

      userFromLocalStorage.providerId = userNormalized.providerId;
      userFromLocalStorage.providerToken = userNormalized.providerToken;

      const userValidateToken: IUser | null = await _validateToken(
        userFromLocalStorage
      );

      return userValidateToken?.email;
    }

    _settingSession(null);
    return null;
  };

  const _createOrSignInUserByLoginGoogle = (userFirebase: User) => {
    setTimeout(async () => {
      const userNormalized: IUser = await __normalizeUser(userFirebase);

      const responseUser: IUser =
        await serviceMethodsInstance.authServiceMethods.signUp({
          email: `${userNormalized.email}`,
          password: `${process.env.NEXT_PUBLIC_SOCIAL_PRICES_SIGN_UP_PASSWORD_TEMP}`,
          authProvider: userNormalized.authProvider,
          avatar: userNormalized.avatar ?? undefined,
          extraDataProvider: userNormalized.extraDataProvider,
          phoneNumbers: userNormalized.phoneNumbers ?? [],
          uid: userNormalized.uid,
        });

      responseUser.providerId = userNormalized.providerId;
      responseUser.providerToken = userNormalized.providerToken;
      responseUser.loggedByAuthProvider = UsersEnum.Provider.GOOGLE;

      setUser(responseUser);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);

      setIsLoading(false);
    }, 3000);
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      _createOrSignInUserByLoginGoogle(response.user);
    } catch (error: any) {
      setIsLoading(false);

      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IUser =
        await serviceMethodsInstance.authServiceMethods.signIn(
          username,
          password
        );

      response.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

      setUser(response);

      router.push(Urls.VALIDATE_SIGN_IN_CODE);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response: IUser =
        await serviceMethodsInstance.authServiceMethods.signUp({
          email: email,
          password,
        });

      response.loggedByAuthProvider = UsersEnum.Provider.SOCIAL_PRICES;

      setUser(response);

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

      _settingSession(null);

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
      if (!user?.authToken) {
        router.push(Urls.LOGIN);
        return false;
      }

      setIsLoading(true);

      const isValidateSignInCode: boolean =
        await serviceMethodsInstance.authServiceMethods.validateSignInCode(
          user.authToken,
          codeValue
        );

      if (!isValidateSignInCode) {
        return false;
      }

      const userResponse: IUser =
        await serviceMethodsInstance.usersServiceMethods.getUserByToken(
          user.authToken!
        );

      const newUser: IUser = __mergeUserUpdated(user, userResponse);

      _settingSession(newUser);

      router.push(Urls.DASHBOARD);
      return true;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSession = (newUser: IUser | null): void => {
    if (!newUser) {
      return;
    }

    if (!user) {
      _settingSession(null);
      return;
    }

    const userUpdated: IUser = __mergeUserUpdated(user, newUser);

    _settingSession(userUpdated);
  };

  /**
   * Method main to mount app data
   */
  const _componentWillMount = useCallback(async () => {
    const hasNoCookieAuth: boolean = !Cookies.get(
      CookiesEnum.CookiesName.COOKIE_AUTH
    );

    if (hasNoCookieAuth) {
      _settingSession(null);
      return;
    }

    const userFromLocalStorage: IUser | null =
      LocalStorageUserMethods.getUser();

    if (!userFromLocalStorage) {
      _settingSession(null);
      return;
    }

    if (
      userFromLocalStorage?.loggedByAuthProvider === UsersEnum.Provider.GOOGLE
    ) {
      const cancel = auth.onIdTokenChanged(_settingSessionFirebase);

      return () => cancel();
    }

    await _validateToken(userFromLocalStorage);
  }, []);

  useEffect(() => {
    _componentWillMount();
  }, [_componentWillMount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginGoogle,
        isLoading,
        logout,
        login,
        create,
        validateSignInCode,
        setUser,
        updateUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
