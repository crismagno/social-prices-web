"use client";

import { useEffect } from "react";

import Cookies from "js-cookie";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import useAuthData from "../../data/context/auth/useAuthData";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import Urls from "../../shared/common/routes-app/routes-app";

const useForceRedirect = (routeToRedirect: string = Urls.LOGIN): boolean => {
  const { user } = useAuthData();

  const router: AppRouterInstance = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(routeToRedirect);
      return;
    }

    if (user && Cookies.get(CookiesEnum.CookiesName.COOKIE_AUTH)) {
      router.push(Urls.DASHBOARD);
    }
  }, [user, router]);

  return true;
};

export default useForceRedirect;
