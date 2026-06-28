"use client";

import { useState } from "react";

import { Button, Card } from "antd";

import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";

import Avatar from "../../../components/common/Avatar/Avatar";
import ContainerTitle from "../../../components/common/ContainerTitle/ContainerTitle";
import EditAvatarModal from "../../../components/common/EditAvatarModal/EditAvatarModal";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import Urls from "../../../shared/common/routes-app/routes-app";
import ProfileAddressesEdit from "./components/ProfileAddressesEdit/ProfileAddressesEdit";
import ProfileAuthEdit from "./components/ProfileAuthEdit/ProfileAuthEdit";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";
import ProfilePhonesEdit from "./components/ProfilePhonesEdit/ProfilePhonesEdit";

export default function ProfileEditPage() {
  const { user } = useAuthData();
  const { t } = useLanguageData()!;

  const [isVisibleEditAvatarModal, setIsVisibleAvatarModal] =
    useState<boolean>(false);

  return (
    <Layout
      title={t("profile.updateProfile")}
      subtitle={t("profile.personalDataToUpdate")}
      hasBackButton
    >
      <Card className=" h-min-80 mt-6">
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <Avatar
            src={user?.avatar}
            width={180}
            className="shadow-lg border-none cursor-pointer z-10"
            onClick={() => setIsVisibleAvatarModal(true)}
            title={t("profile.editAvatar")}
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

        <ContainerTitle
          title={
            <div className="flex items-center">
              <label className="mr-4">{t("profile.dangerZone")}</label>
            </div>
          }
          className="mt-10"
        >
          <div className="mt-6">
            <Button
              danger
              type="primary"
              href={Urls.PROFILE_DELETE}
              icon={<DeleteOutlined />}
            >
              {t("profile.deleteAccount")}
            </Button>
          </div>
        </ContainerTitle>

        {/* <ProfileCardsPaymentsEdit /> */}
      </Card>
    </Layout>
  );
}
