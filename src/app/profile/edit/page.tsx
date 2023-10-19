"use client";

import { Tooltip } from "antd";

import Avatar from "../../../components/common/Avatar/Avatar";
import BackButton from "../../../components/common/BackButton/BackButton";
import Card from "../../../components/common/Card/Card";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/hook/useAuthData";
import ProfileAddressesEdit from "./components/ProfileAddressesEdit/ProfileAddressesEdit";
import ProfileAuthEdit from "./components/ProfileAuthEdit/ProfileAuthEdit";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";
import ProfilePhonesEdit from "./components/ProfilePhonesEdit/ProfilePhonesEdit";

export default function ProfileEditPage() {
  const { user } = useAuthData();

  return (
    <Layout title="Profile Edit" subtitle="Your personal data to update">
      <Card className=" h-min-80 mt-10">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <div className="cursor-pointer z-10">
            <Tooltip title="test">
              <Avatar
                src={user?.avatar}
                width={130}
                height={130}
                className="shadow-lg border-none"
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-end relative">
          <BackButton />
        </div>

        <ProfileAuthEdit />

        <ProfileEdit />

        <ProfileAddressesEdit />

        <ProfilePhonesEdit />
      </Card>
    </Layout>
  );
}
