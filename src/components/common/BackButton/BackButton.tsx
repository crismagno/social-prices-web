"use client";

import { Button } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import useLanguageData from "../../../data/context/language/useLanguageData";

export const BackButton: React.FC = () => {
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  return (
    <Button className="z-50" onClick={() => router.back()}>
      {t("common.back")}
    </Button>
  );
};
