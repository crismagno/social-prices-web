"use client";

import { useState } from "react";

import { message } from "antd";
import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import ButtonCommon from "../../components/common/ButtonCommon/ButtonCommon";
import handleClientError from "../../components/common/handleClientError/handleClientError";
import HrCustom from "../../components/common/HrCustom/HrCustom";
import Loading from "../../components/common/Loading/Loading";
import useAuthData from "../../data/hook/useAuthData";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import IUser from "../../shared/business/users/user.interface";

export default function UpdateEmail() {
  const { updateUserSession } = useAuthData();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isSentUpdateEmail, setIsSentUpdateEmail] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");

  const [newEmail, setNewEmail] = useState<string>("");

  const [codeValue, setCodeValue] = useState<string>("");

  const handleSendUpdateEmailCode = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim()) {
        setCodeValue("");
        message.warning("Please fill email.");
        return;
      }

      await serviceMethodsInstance.usersServiceMethods.sendUpdateEmailCode(
        email
      );

      setIsSentUpdateEmail(true);

      message.success("Code to update email was sent to your email.");
    } catch (error: any) {
      message.error("Error when attempt send update email code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmail = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!email.trim() || !codeValue.trim() || !newEmail.trim()) {
        message.warning("Please fill input values.");
        return;
      }

      const newUser: IUser =
        await serviceMethodsInstance.usersServiceMethods.updateEmail({
          codeValue,
          email,
          newEmail,
        });

      message.success("Your email has been reset.");

      updateUserSession(newUser);

      router.back();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col justify-center items-center 
        bg-gradient-to-r from-teal-100 to-slate-200"
    >
      <div className="flex flex-col justify-center items-center lg:w-1/4 md:w-1/2">
        <div
          className="flex flex-col justify-center items-center 
          w-full h-full p-3 shadow-2xl bg-white rounded-lg"
        >
          <span className="text-lg text-center mt-6">Update Email</span>

          <form onSubmit={handleSendUpdateEmailCode} className="w-full">
            <AuthInput
              value={email}
              onChange={setEmail}
              placeholder="Type your email"
              disabled={isSubmitting}
              label="Email"
              divClassName="w-full"
            />

            <button
              className="px-4 py-2 mt-1 text-teal-600 w-full text-sm "
              onClick={handleSendUpdateEmailCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loading height={30} width={30} />
              ) : (
                "Send update email code"
              )}
            </button>
          </form>

          {isSentUpdateEmail && (
            <form onSubmit={handleUpdateEmail} className="w-full h-full">
              <HrCustom className="my-6" />

              <AuthInput
                value={codeValue}
                onChange={setCodeValue}
                placeholder="Type code value"
                disabled={isSubmitting}
                label="Code"
                divClassName="w-full"
              />

              <AuthInput
                value={newEmail}
                onChange={setNewEmail}
                placeholder="Type your new email"
                disabled={isSubmitting}
                label="New Email"
                divClassName="w-full"
              />

              <ButtonCommon
                className="justify-center items-center w-full mt-5 py-2"
                onClick={handleUpdateEmail}
                disabled={isSubmitting}
                color="success"
                loading={{
                  isLoading: isSubmitting,
                  height: 30,
                  width: 30,
                }}
              >
                Update
              </ButtonCommon>
            </form>
          )}
        </div>

        <HrCustom />

        <ButtonCommon
          className="text-sm rounded-2xl px-4"
          onClick={() => router.back()}
          disabled={isSubmitting}
          color="success"
        >
          Go Back
        </ButtonCommon>
      </div>
    </div>
  );
}
