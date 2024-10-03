"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import handleClientError from "../../components/common/handleClientError/handleClientError";
import Loading from "../../components/common/Loading/Loading";
import useAuthData from "../../data/context/auth/useAuthData";
import useForceRedirect from "../../hooks/useForceRedirect/useForceRedirect";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ISearchEmployee } from "../../shared/business/employees/employees.types";
import Urls from "../../shared/common/routes-app/routes-app";

export default function LoginPage() {
  useForceRedirect(Urls.LOGIN_EMPLOYEE);

  const { loginGoogle, login, create } = useAuthData();

  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState<string>();

  const [password, setPassword] = useState<string>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSearchEmployee = async (event: any) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      if (!emailOrUsername) {
        throw new Error("Please enter with your credential!");
      }

      const response: ISearchEmployee[] =
        await serviceMethodsInstance.authServiceMethods.searchEmployees(
          emailOrUsername
        );

      console.log(response);

      // await login(emailOrUsername, password);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-row h-screen">
      <div className="hidden md:block md:w-2-1/2 lg:w-2/3">
        <img
          src="https://source.unsplash.com/random"
          alt="Images on side"
          className="h-screen w-full object-cover"
        />
      </div>

      {isSubmitting && (
        <div className="h-full w-full absolute flex justify-center items-center bg-gray-500/30 top-0 z-50">
          <Loading />
        </div>
      )}

      <form
        onSubmit={handleSearchEmployee}
        className="relative flex flex-col justify-center m-10 w-full md:w-1/2 lg:w-1/3"
      >
        <h1 className="text-xl font-bold text-center">Enter as a Employee</h1>

        <AuthInput
          value={emailOrUsername}
          onChange={setEmailOrUsername}
          label="User"
          type="text"
          placeholder="Type email or username"
        />

        <AuthInput
          value={password}
          onChange={setPassword}
          label="Password"
          type="password"
          placeholder="Type your password"
          useShowPassword
        />

        <button
          className="mt-4 bg-green-500 hover:bg-green-400 text-white rounded-lg py-3 px-4"
          onClick={handleSearchEmployee}
        >
          Search
        </button>

        <hr className="border-gray-300 my-6 w-full" />

        <p>
          <a
            className="text-blue-500 hover:text-blue-600 font-semibold cursor-pointer ml-2"
            onClick={() => router.push(Urls.LOGIN)}
          >
            Enter as a User?
          </a>
        </p>
      </form>
    </div>
  );
}
