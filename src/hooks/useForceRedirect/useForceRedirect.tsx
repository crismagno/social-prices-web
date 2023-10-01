"use client";

import { useEffect } from "react";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import useAuthData from "../../data/hook/useAuthData";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import Urls from "../../shared/common/routes-app/routes-app";

const useForceRedirect = () => {
  const { user } = useAuthData();

  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(Urls.LOGIN);
      return;
    }

    if (user && Cookies.get(CookiesEnum.CookiesName.COOKIE_AUTH)) {
      router.push(Urls.DASHBOARD);
    }
  }, [user, router]);

  return true;
};

export default useForceRedirect;
