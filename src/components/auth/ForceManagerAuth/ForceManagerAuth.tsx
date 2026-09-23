"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import useManagerAuthData from "../../../data/context/managerAuth/useManagerAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";
import LoadingFull from "../../common/LoadingFull/LoadingFull";

const ForceManagerAuth = ({ children }: any) => {
  // Gate on isLogged, not on manager: after the password step the context already
  // holds the manager, but the session only exists once the emailed code is
  // redeemed. Gating on manager let the panel render in between, calling the API
  // with whatever token was left in localStorage.
  const { isLogged, isLoading } = useManagerAuthData();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLogged) {
      router.push(Urls.MANAGER_LOGIN);
    }
  }, [isLoading, isLogged, router]);

  if (isLoading) {
    return <LoadingFull />;
  }

  if (!isLogged) {
    return null;
  }

  return <>{children}</>;
};

export default ForceManagerAuth;
