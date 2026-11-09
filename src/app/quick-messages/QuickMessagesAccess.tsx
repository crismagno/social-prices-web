"use client";

import { Result } from "antd";

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

  if (employee?.level === EmployeesEnum.Level.EMPLOYEE) {
    return <Result status="403" subTitle={t("quickMessages.forbidden")} />;
  }

  return <>{children}</>;
}
