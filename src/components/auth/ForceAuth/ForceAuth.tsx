"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";

import useAuthData from "../../../data/hook/useAuthData";
import CookiesName from "../../../shared/common/cookies/cookies";
import LocalStorageEnum from "../../../shared/common/local-storage/local-storage.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import Loading from "../../common/Loading/Loading";

const ForceAuth = ({ children }: any) => {
  const { user, isLoading } = useAuthData();

  const router = useRouter();

  if (!isLoading && user?.email) {
    return (
      <>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            if (!document.cookies?.includes(${CookiesName.COOKIE_AUTH})) {
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

  if (isLoading) {
    return (
      <div className="h-screen">
        <Loading />
      </div>
    );
  }

  router.push(Urls.LOGIN);
  return null;
};

export default ForceAuth;
