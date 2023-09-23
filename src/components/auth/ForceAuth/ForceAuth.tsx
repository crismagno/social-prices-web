"use client";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";

import useAuthData from "../../../data/hook/useAuthData";
import CookiesName from "../../../shared/common/cookies/cookies";
import LocalStorageEnum from "../../../shared/common/local-storage/local-storage.enum";
import Urls from "../../../shared/common/routes-app/routes-app";

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
      <div className="flex justify-center items-center h-screen">
        <Image src={"/loading.gif"} alt="loading" width={50} height={50} />
      </div>
    );
  }

  router.push(Urls.LOGIN);
  return null;
};

export default ForceAuth;
