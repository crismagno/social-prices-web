"use client";

import React from "react";

import useLanguageData from "../../../data/context/language/useLanguageData";

interface Props {
  isTrue: boolean;
}

const YesNo: React.FC<Props> = ({ isTrue }) => {
  const { t } = useLanguageData();
  return <>{isTrue ? t("common.yes") : t("common.no")}</>;
};

export default YesNo;
