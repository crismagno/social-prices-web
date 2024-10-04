"use client";

import { useState } from "react";

import { Button, Divider, List, message, Tooltip } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { RightOutlined, ShopOutlined } from "@ant-design/icons";

import AuthInput from "../../components/common/AuthInput/AuthInput";
import Avatar from "../../components/common/Avatar/Avatar";
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

  const [selectedSearchEmployee, setSelectedSearchEmployee] =
    useState<ISearchEmployee | null>();

  const [searchEmployees, setSearchEmployees] = useState<ISearchEmployee[]>([]);

  const [password, setPassword] = useState<string>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSearchEmployee = async (event: any) => {
    event?.preventDefault();

    try {
      setIsSubmitting(true);
      setSelectedSearchEmployee(null);
      setSearchEmployees([]);

      if (!emailOrUsername) {
        throw new Error("Please enter with your email or username!");
      }

      const response: ISearchEmployee[] =
        await serviceMethodsInstance.authServiceMethods.searchEmployees(
          emailOrUsername
        );

      if (response?.length === 0) {
        message.error(
          "Please enter with correct credential, email or username valid"
        );
      }

      if (response.length === 1) {
        setSelectedSearchEmployee(response[0]);
      }

      setSearchEmployees(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginEmployee = async (event: any) => {
    event?.preventDefault();

    try {
      setIsSubmitting(true);

      if (!password) {
        throw new Error("Please enter with your password!");
      }

      // const response: ISearchEmployee[] =
      //   await serviceMethodsInstance.authServiceMethods.searchEmployees(
      //     emailOrUsername
      //   );

      // if (response?.length === 0) {
      //   message.error("Please enter with correct, email or username valid");
      // }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-row h-screen">
      <div className="hidden md:block md:w-2-1/2 lg:w-2/3">
        <Image
          src="/assets/images-random/social-prices-logo-test.webp"
          alt="Images on side"
          width={1000}
          height={1000}
          className="h-screen w-full object-cover"
        />
      </div>

      {isSubmitting && (
        <div className="h-full w-full absolute flex justify-center items-center bg-gray-500/30 top-0 z-50">
          <Loading />
        </div>
      )}

      <form className="relative flex flex-col justify-center m-10 w-full md:w-1/2 lg:w-1/3">
        <h1 className="text-xl font-bold text-center">Enter as a Employee</h1>

        {!selectedSearchEmployee && (
          <>
            <AuthInput
              value={emailOrUsername}
              onChange={setEmailOrUsername}
              label="User"
              type="text"
              placeholder="Type email or username"
            />

            {searchEmployees.length > 0 && (
              <List
                className="max-h-56 overflow-auto px-2"
                itemLayout="horizontal"
                dataSource={searchEmployees}
                renderItem={(item: ISearchEmployee, index: number) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.employeeAvatar} width={50} />}
                      title={
                        <label className="text-sm">
                          {item.employeeName}
                          <Divider type="vertical" />
                          {item.employeeUsername}
                          <Divider type="vertical" />
                          <Tooltip
                            title={
                              <div className="flex flex-col justify-center items-center">
                                <Avatar src={item.userAvatar} />
                                <label className="text-sm">
                                  {item.userName}
                                </label>
                                <label className="text-sm">
                                  {item.userUsername}
                                </label>
                              </div>
                            }
                          >
                            <ShopOutlined />
                          </Tooltip>
                        </label>
                      }
                      description={item.employeeEmail}
                    />

                    <Tooltip title="Select Employee">
                      <Button
                        icon={<RightOutlined />}
                        onClick={() => setSelectedSearchEmployee(item)}
                        type="primary"
                      />
                    </Tooltip>
                  </List.Item>
                )}
              />
            )}

            <button
              className="mt-4 bg-green-500 hover:bg-green-400 text-white rounded-lg py-3 px-4"
              onClick={handleSearchEmployee}
            >
              Search
            </button>
          </>
        )}

        {selectedSearchEmployee && (
          <div className="mt-10 flex-col justify-center w-full">
            <div className="flex flex-col justify-center items-center">
              <Avatar src={selectedSearchEmployee.employeeAvatar} width={100} />

              <label className="text-base mt-5">
                {selectedSearchEmployee.employeeName}
              </label>

              <label className="text-sm text-gray-400">
                {selectedSearchEmployee.employeeUsername}
              </label>

              <label className="text-sm  text-gray-400">
                {selectedSearchEmployee.employeeEmail}

                <Divider type="vertical" />

                <Tooltip
                  title={
                    <div className="flex flex-col justify-center items-center">
                      <Avatar src={selectedSearchEmployee.userAvatar} />
                      <label className="text-sm">
                        {selectedSearchEmployee.userName}
                      </label>
                      <label className="text-sm">
                        {selectedSearchEmployee.userUsername}
                      </label>
                    </div>
                  }
                >
                  <ShopOutlined />
                </Tooltip>
              </label>
            </div>

            <AuthInput
              value={password}
              onChange={setPassword}
              label="Password"
              type="password"
              placeholder="Type your password"
              useShowPassword
            />

            <button
              className="mt-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-3 px-4 w-full"
              onClick={handleLoginEmployee}
            >
              Login
            </button>

            <button
              className="mt-4 bg-green-500 hover:bg-green-400 text-white rounded-lg py-3 px-4 w-full"
              onClick={() => setSelectedSearchEmployee(null)}
            >
              Back Search
            </button>
          </div>
        )}

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
