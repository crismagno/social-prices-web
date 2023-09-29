"use client";

import { useEffect, useRef, useState } from "react";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import Loading from "../../components/common/Loading/Loading";
import WormAlert, {
  IWormAlertRefProps,
  WormAlertTypeEnum,
} from "../../components/common/WorkAlert/WormAlert";
import { IconWarning } from "../../components/elements/icons/icons";
import useAuthData from "../../data/hook/useAuthData";
import CookiesEnum from "../../shared/common/cookies/cookies.enum";
import Urls from "../../shared/common/routes-app/routes-app";

export default function ValidateSignInCode() {
  const { user, validateSignInCode } = useAuthData();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      setIsSubmitting(true);
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
          "Code invalid",
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col justify-center items-center 
    bg-gradient-to-r from-gray-50 to-gray-200"
    >
      <div
        className="flex flex-col justify-center items-center w-1/4 p-8
       p-3 shadow-2xl bg-white"
      >
        <WormAlert
          ref={wormTextMessage}
          className="my-3 w-full"
          icon={IconWarning("text-large mr-2")}
        />

        <span className="text-lg">Validate Sign In Code</span>

        <input
          value={codeValue}
          onChange={(e) => setCodeValue(e.target.value)}
          placeholder="Type your code here..."
          className="
					px-4 py-3 bg-gray-100 rounded-lg mt-6 w-full
					 focus:bg-white focus:border-blue-100
					 transition-all text-lg text-center"
          disabled={isSubmitting}
        />

        <button
          className="flex justify-center items-center px-4 py-2 rounded-md mt-5
          bg-gradient-to-r from-green-400 to-green-600 text-white w-full"
          onClick={handleValidateSignInCode}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loading height={30} width={30} /> : "Send"}
        </button>
      </div>
    </div>
  );
}
