"use client";

import { useState } from "react";

import { Tooltip } from "antd";

import Avatar from "../../../components/common/Avatar/Avatar";
import Card from "../../../components/common/Card/Card";
import EditAvatarModal from "../../../components/common/EditAvatarModal/EditAvatarModal";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/hook/useAuthData";
import ProfileAddressesEdit from "./components/ProfileAddressesEdit/ProfileAddressesEdit";
import ProfileAuthEdit from "./components/ProfileAuthEdit/ProfileAuthEdit";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";
import ProfilePhonesEdit from "./components/ProfilePhonesEdit/ProfilePhonesEdit";

export default function ProfileEditPage() {
  const { user } = useAuthData();

  const [isVisibleEditAvatarModal, setIsVisibleAvatarModal] =
    useState<boolean>(false);

  return (
    <Layout
      title="Profile Edit"
      subtitle="Your personal data to update"
      hasBackButton
    >
      <Card className=" h-min-80 mt-10">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <div className="cursor-pointer z-10">
            <Tooltip title="Edit avatar" placement="bottom">
              <Avatar
                src={user?.avatar}
                width={130}
                className="shadow-lg border-none"
                onClick={() => setIsVisibleAvatarModal(true)}
              />

              <EditAvatarModal
                isVisible={isVisibleEditAvatarModal}
                onCancel={() => setIsVisibleAvatarModal(false)}
                onOk={() => setIsVisibleAvatarModal(false)}
              />
            </Tooltip>
          </div>
        </div>

        <ProfileAuthEdit />

        <ProfileEdit />

        <ProfileAddressesEdit />

        <ProfilePhonesEdit />

        {/* <ProfileCardsPaymentsEdit /> */}
      </Card>
    </Layout>
  );
}
