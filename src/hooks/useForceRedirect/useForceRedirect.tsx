"use client";

import { useEffect } from 'react';

import Cookies from 'js-cookie';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import useAuthData from '../../data/context/auth/useAuthData';
import CookiesEnum from '../../shared/common/cookies/cookies.enum';
import Urls from '../../shared/common/routes-app/routes-app';
import { homeUrlFor } from '../../shared/common/routes-app/home-url';

const useForceRedirect = (routeToRedirect: string = Urls.LOGIN): boolean => {
  const { user, isCustomer, isLoading } = useAuthData();

  const router: AppRouterInstance = useRouter();

  useEffect(() => {
    // The session is still being read: deciding now would send someone who is
    // signed in to the login, and leave them there.
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push(routeToRedirect);
      return;
    }

    if (user && Cookies.get(CookiesEnum.CookiesName.COOKIE_AUTH)) {
      // Replaced, so going back does not land on the login again.
      router.replace(homeUrlFor(isCustomer));
    }
  }, [user, isCustomer, isLoading, router]);

  return true;
};

export default useForceRedirect;
