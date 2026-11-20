"use client";

import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import useAuthData from '../../../data/context/auth/useAuthData';
import CookiesEnum from '../../../shared/common/cookies/cookies.enum';
import LocalStorageEnum
  from '../../../shared/common/local-storage/local-storage.enum';
import Urls from '../../../shared/common/routes-app/routes-app';
import {
  rememberPostLoginRedirect,
} from '../../../shared/utils/auth/post-login-redirect';
import LoadingFull from '../../common/LoadingFull/LoadingFull';

const ForceAuth = ({ children }: any) => {
  const { user, isLoading } = useAuthData();

  const router: AppRouterInstance = useRouter();

  if (isLoading) {
    return <LoadingFull />;
  }

  if (user?.email) {
    return (
      <>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            if (!document.cookies?.includes(${CookiesEnum.CookiesName.COOKIE_AUTH})) {
              window.location.href = ${Urls.LOGIN};
              localStorage.removeItem(${LocalStorageEnum.keys.USER});
            }
          `,
            }}
          ></script>
        </Head>
        {children}
      </>
    );
  }

  // A visitor who opened a store's chat link comes back to it after signing in.
  // Only that: any other page asked for while logged out (a logout, an expired
  // session) keeps landing on the account's home, as before.
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith(Urls.CUSTOMER_CHATS)
  ) {
    rememberPostLoginRedirect(
      `${window.location.pathname}${window.location.search}`,
    );
  }

  router.push(Urls.LOGIN);

  return null;
};

export default ForceAuth;
