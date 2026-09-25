"use client";

import { Tag, Tooltip } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  FeatureKey,
  IFeatureUsage,
} from "../../../shared/business/users/user-limits.interface";

interface Props {
  feature: FeatureKey;
  usage: IFeatureUsage | undefined;
}

export const FeatureUsageBadge: React.FC<Props> = ({ feature, usage }) => {
  const { t } = useLanguageData();

  if (!usage) {
    return null;
  }

  const isAtLimit: boolean = usage.limit !== null && usage.used >= usage.limit;

  const text: string =
    usage.limit === null
      ? t("limits.unlimited")
      : t("limits.usage")
          .replace("{used}", String(usage.used))
          .replace("{limit}", String(usage.limit));

  return (
    <Tooltip title={t(`limits.features.${feature}`)}>
      <Tag color={isAtLimit ? "red" : "blue"}>{text}</Tag>
    </Tooltip>
  );
};
