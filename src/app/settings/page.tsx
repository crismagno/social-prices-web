"use client";

import { Card } from "antd";

import ContainerTitle from "../../components/common/ContainerTitle/ContainerTitle";
import Description from "../../components/common/Description/Description";
import { LanguageSelector } from "../../components/common/LanguageSelector/LanguageSelector";
import Layout from "../../components/template/Layout/Layout";
import ThemeButton from "../../components/template/ThemeButton/ThemeButton";
import useLanguageData from "../../data/context/language/useLanguageData";

export default function SettingsPage() {
  const { t } = useLanguageData()!;

  return (
    <Layout
      subtitle={t("settings.subtitle")}
      title={t("settings.title")}
      hasBackButton
    >
      <Card className="h-min-80 mt-10">
        <ContainerTitle title={t("settings.layout")} className="mt-6 text-base">
          <div className="flex flex-col gap-6">
            <Description
              label={`${t("settings.colorMode")}: `}
              description={<ThemeButton />}
            />

            <div className="mt-4">
              <LanguageSelector />
            </div>
          </div>
        </ContainerTitle>
      </Card>
    </Layout>
  );
}
