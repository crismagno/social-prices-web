"use client";

import { Button, Space } from "antd";

import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import DescriptionInput from "../../../../../components/common/DescriptionInput/DescriptionInput";
import useAuthData from "../../../../../data/context/auth/useAuthData";
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import Urls from "../../../../../shared/common/routes-app/routes-app";

const ProfileAuthEdit: React.FC = () => {
  const { user } = useAuthData();
  const { t } = useLanguageData()!;

  return (
    <ContainerTitle
      title={t("profile.authentication")}
      className="mt-20"
      extraHeader={
        <Space.Compact>
          <Button className="mr-2" href={Urls.UPDATE_EMAIL}>
            {t("common.email")}
          </Button>
          <Button href={Urls.RECOVER_PASSWORD}>{t("auth.password")}</Button>
        </Space.Compact>
      }
    >
      <div className="flex">
        <div className="flex flex-col justify-start w-1/2">
          <DescriptionInput
            label={t("auth.username")}
            placeholder={t("placeholders.enterUsername")}
            value={user?.username ?? ""}
            disabled
          />

          <DescriptionInput
            label={t("auth.password")}
            type="password"
            value={"1234567890"}
            disabled
          />
        </div>

        <div className="flex flex-col justify-start w-1/2">
          <DescriptionInput
            label={t("common.email")}
            value={user?.email ?? ""}
            disabled
          />
        </div>
      </div>
    </ContainerTitle>
  );
};

export default ProfileAuthEdit;
