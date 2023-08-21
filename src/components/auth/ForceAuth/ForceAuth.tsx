"use client";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";

import useAuthData from "../../../data/hook/useAuthData";
import CookiesName from "../../../shared/common/cookies/cookies";
import Urls from "../../../shared/common/routes/routes";

const ForceAuth = ({ children }: any) => {
  const { user, isLoading } = useAuthData();

  const router = useRouter();

  const renderContent = () => {
    return (
      <>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
								if (!document.cookies?.includes(${CookiesName.COOKIE_AUTH})) {
									window.location.href = ${Urls.LOGIN}
								}
							`,
            }}
          ></script>
        </Head>
        {children}
      </>
    );
  };

  const renderLoading = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src={"/loading.gif"} alt="loading" width={50} height={50} />
      </div>
    );
  };

  if (!isLoading && user?.email) {
    return renderContent();
  }

  if (isLoading) {
    return renderLoading();
  }

  console.log("test---");

  router.push(Urls.LOGIN);
  return null;
};

export default ForceAuth;
