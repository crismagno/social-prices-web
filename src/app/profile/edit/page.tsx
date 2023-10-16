"use client";

import Avatar from "../../../components/common/Avatar/Avatar";
import BackButton from "../../../components/common/BackButton/BackButton";
import Card from "../../../components/common/Card/Card";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../../components/common/Description/Description";
import DescriptionInput from "../../../components/common/DescriptionInput/DescriptionInput";
import {
  IconFinger,
  IconQuestion,
} from "../../../components/common/icons/icons";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/hook/useAuthData";
import UsersEnum from "../../../shared/business/users/users.enum";
import ProfileAddressesEdit from "./components/ProfileAddressesEdit/ProfileAddressesEdit";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";
import ProfilePhonesEdit from "./components/ProfilePhonesEdit/ProfilePhonesEdit";

export default function ProfileEditPage() {
  const { user } = useAuthData();

  return (
    <Layout title="Profile Edit" subtitle="Your personal data to update">
      <Card className=" h-min-80 mt-10">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <div className="cursor-pointer">
            <Avatar
              src={user?.avatar}
              width={130}
              height={130}
              className="shadow-lg border-none"
            />
          </div>
        </div>

        <div className="flex justify-end relative">
          <BackButton />
        </div>

        <ContainerTitle title="Information" className="mt-6">
          <div className="flex">
            <Description
              label="Auth Provider"
              className="mr-5"
              description={
                user?.authProvider
                  ? UsersEnum.ProviderLabels[user.authProvider]
                  : ""
              }
              leftIcon={IconFinger()}
            />

            <Description
              label="Status"
              description={
                user?.status ? UsersEnum.StatusLabels[user.status] : ""
              }
              leftIcon={IconQuestion()}
            />
          </div>
        </ContainerTitle>

        <ContainerTitle title="Auth" className="mt-6">
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
              <DescriptionInput
                label="Email"
                value={user?.email ?? ""}
                disabled
              />
            </div>
          </div>
        </ContainerTitle>

        <ProfileEdit />

        <ProfileAddressesEdit />

        <ProfilePhonesEdit />
      </Card>
    </Layout>
  );
}
