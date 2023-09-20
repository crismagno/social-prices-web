import {
  createContext,
  useEffect,
  useState,
} from 'react';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

import firebaseApp from '../../services/firebase/config';
import AuthServiceMethods
  from '../../services/social-prices-api/auth/auth-service.methods';
import IUser from '../../shared/business/users/user.interface';
import UsersEnum from '../../shared/business/users/users.enum';
import CookiesName from '../../shared/common/cookies/cookies';
import Urls from '../../shared/common/routes-app/routes-app';

const googleProvider = new GoogleAuthProvider();
const auth = getAuth(firebaseApp);

export interface IAuthContext {
  user: IUser | null;
  isLoading: boolean;
  loginGoogle: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  create: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  isLoading: true,
  loginGoogle: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  login: async (): Promise<void> => {},
  create: async (): Promise<void> => {},
});

const normalizeUser = async (userFirebase: User): Promise<IUser> => {
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
    phoneNumbers: userFirebase.phoneNumber ? [userFirebase.phoneNumber] : null,
    status: null,
  };
};

const managerCookie = (isLogged: boolean) => {
  if (isLogged) {
    Cookies.set(CookiesName.COOKIE_AUTH, `${isLogged}`, {
      expires: 30,
    });
  } else {
    Cookies.remove(CookiesName.COOKIE_AUTH);
  }
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();

  const settingSessionFirebase = async (userFirebase: User | null) => {
    if (userFirebase?.email) {
      const userNormalized = await normalizeUser(userFirebase);
      setUser(userNormalized);
      managerCookie(true);
      setIsLoading(false);
      return userNormalized.email;
    }

    setUser(null);
    managerCookie(false);
    setIsLoading(false);
    return null;
  };

  const settingSession = (user: IUser | null) => {
    if (user?.email) {
      setUser(user);
      managerCookie(true);
      setIsLoading(false);
      return user.email;
    }

    setUser(null);
    managerCookie(false);
    setIsLoading(false);
    return null;
  };

  const loginGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithPopup(auth, googleProvider);

      await settingSessionFirebase(response.user);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw "Error occur when attempt login with google.";
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      // const response = await signInWithEmailAndPassword(
      //   auth,
      //   username,
      //   password
      // );

      // await settingSessionFirebase(response.user);

      const authServiceMethods = new AuthServiceMethods();
      const response: IUser = await authServiceMethods.signIn(
        username,
        password
      );

      settingSession(response);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const create = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      // const response = await createUserWithEmailAndPassword(
      //   auth,
      //   username,
      //   password
      // );

      // await settingSessionFirebase(response.user);

      const authServiceMethods = new AuthServiceMethods();
      const response: IUser = await authServiceMethods.signUp({
        email: username,
        password,
        username,
      });

      settingSession(response);

      router.push(Urls.DASHBOARD);
    } catch (error: any) {
      throw "Error occur when attempt create.";
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      if (user?.authProvider !== UsersEnum.Provider.SOCIAL_PRICES) {
        await signOut(auth);
      }

      await settingSessionFirebase(null);

      router.push(Urls.LOGIN);
    } catch (error: any) {
      throw "Error occur when attempt logout.";
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Cookies.get(CookiesName.COOKIE_AUTH)) {
      const cancel = auth.onIdTokenChanged(settingSessionFirebase);

      return () => cancel();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginGoogle, isLoading, logout, login, create }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
