"use client";

import { Button, Space } from "antd";

import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import DescriptionInput from "../../../../../components/common/DescriptionInput/DescriptionInput";
import useAuthData from "../../../../../data/context/auth/useAuthData";
import Urls from "../../../../../shared/common/routes-app/routes-app";

const ProfileAuthEdit: React.FC = () => {
  const { user } = useAuthData();

  return (
    <ContainerTitle
      title="Auth"
      className="mt-20"
      extraHeader={
        <Space.Compact>
          <Button href={Urls.UPDATE_EMAIL}>Email</Button>
          <Button href={Urls.RECOVER_PASSWORD}>Password</Button>
        </Space.Compact>
      }
    >
      <div className="flex">
        <div className="flex flex-col justify-start w-1/2">
          <DescriptionInput
            label="Username"
            placeholder={"Enter with a username"}
            value={user?.username ?? ""}
            disabled
          />

          <DescriptionInput
            label="Password"
            type="password"
            value={"1234567890"}
            disabled
          />
        </div>

        <div className="flex flex-col justify-start w-1/2">
          <DescriptionInput label="Email" value={user?.email ?? ""} disabled />
        </div>
      </div>
    </ContainerTitle>
  );
};

export default ProfileAuthEdit;
