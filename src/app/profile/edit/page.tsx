"use client";

import { useState } from "react";

import { Card } from "antd";

import Avatar from "../../../components/common/Avatar/Avatar";
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
          <Avatar
            src={user?.avatar}
            width={180}
            className="shadow-lg border-none cursor-pointer z-10"
            onClick={() => setIsVisibleAvatarModal(true)}
            title="Edit avatar"
          />

          <EditAvatarModal
            isVisible={isVisibleEditAvatarModal}
            onCancel={() => setIsVisibleAvatarModal(false)}
            onOk={() => setIsVisibleAvatarModal(false)}
          />
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
