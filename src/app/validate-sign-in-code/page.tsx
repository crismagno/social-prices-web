"use client";

import { useEffect, useRef, useState } from "react";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import WormAlert, {
  IWormAlertRefProps,
  WormAlertTypeEnum,
} from "../../components/common/WorkAlert/WormAlert";
import { IconWarning } from "../../components/elements/icons/icons";
import useAuthData from "../../data/hook/useAuthData";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import Urls from "../../shared/common/routes-app/routes-app";

export default function ValidateSignInCode() {
  const { user, validateSignInCode, isLoading } = useAuthData();

  const router = useRouter();

  const [codeValue, setCodeValue] = useState<string>("");

  const wormTextMessage: React.MutableRefObject<IWormAlertRefProps | null> =
    useRef(null);

  useEffect(() => {
    if (!user) {
      router.push(Urls.LOGIN);
      return;
    }

    if (user && Cookies.get(CookiesEnum.CookiesName.COOKIE_AUTH)) {
      router.push(Urls.DASHBOARD);
    }
  }, [user, router]);

  const handleValidateSignInCode = async () => {
    try {
      if (!codeValue.trim()) {
        setCodeValue("");

        wormTextMessage.current?.showWormText(
          "Please fill code value!",
          5,
          WormAlertTypeEnum.DANGER
        );

        return;
      }

      const isCodeValueValid: boolean = await validateSignInCode(codeValue);

      if (!isCodeValueValid) {
        wormTextMessage.current?.showWormText(
          "Code invalid!",
          3,
          WormAlertTypeEnum.DANGER
        );
      }
    } catch (error: any) {
      wormTextMessage.current?.showWormText(
        "Code invalid!",
        3,
        WormAlertTypeEnum.DANGER
      );
    }
  };

  if (isLoading) {
    return <LoadingFull />;
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <WormAlert
        ref={wormTextMessage}
        className="my-3"
        icon={IconWarning("text-large mr-2")}
      />

      <div
        className="flex flex-col justify-center items-center w-1/5
       p-3 shadow-2xl"
      >
        <h2 className="text-lg">Validate Sign In Code</h2>

        <input
          value={codeValue}
          onChange={(e) => setCodeValue(e.target.value)}
          placeholder="Type your code here..."
          className="
					px-4 py-3 bg-gray-100 rounded-lg mt-4
					 focus:bg-white focus:border-blue-100
					 transition-all text-lg text-center"
        />

        <button
          className="px-4 py-2 rounded-md mt-5 w-1/3
          bg-gradient-to-r from-green-400 to-green-600 text-white"
          onClick={handleValidateSignInCode}
        >
          Send
        </button>
      </div>
    </div>
  );
}
