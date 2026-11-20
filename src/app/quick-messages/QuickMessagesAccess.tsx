"use client";

import { Result } from "antd";

import {
  isFeatureDisabled,
  useFeaturesUsage,
} from "../../components/common/FeatureUsageBadge/useFeaturesUsage";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import EmployeesEnum from "../../shared/business/employees/employees.enum";

// The owner, ADMIN and MASTER manage quick messages (the API refuses the rest too).
export default function QuickMessagesAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const { usage } = useFeaturesUsage();

  if (employee?.level === EmployeesEnum.Level.EMPLOYEE) {
    return <Result status="403" subTitle={t("quickMessages.forbidden")} />;
  }

  // A manager can switch the feature off for the account (the API refuses it
  // too).
  if (isFeatureDisabled(usage, "quick-messages")) {
    return <Result status="403" subTitle={t("quickMessages.disabled")} />;
  }

  return <>{children}</>;
}
