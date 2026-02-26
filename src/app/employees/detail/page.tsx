"use client";

import { useState } from "react";

import { Card } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IEmployee } from "../../../shared/business/employees/employee.interface";
import { EmployeeEdit } from "../components/EmployeeEdit/EmployeeEdit";

export default function EmployeeDetailPage() {
  const { t } = useLanguageData()!;
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const employeeId: string | null = searchParams.get("empid");

  const [employeeToEdit, setEmployeeToEdit] = useState<IEmployee | null>();

  return (
    <Layout
      subtitle={
        employeeToEdit
          ? t("employees.editEmployeeDetails")
          : t("employees.newEmployeeDetails")
      }
      title={
        employeeToEdit
          ? `${t("employees.editEmployee")}: ${employeeToEdit?.name}`
          : t("employees.newEmployee")
      }
      hasBackButton
    >
      <Card className="h-min-80 mt-2">
        <EmployeeEdit
          employeeId={employeeId}
          onEmployeeToEdit={(employee: IEmployee | null) =>
            setEmployeeToEdit(employee)
          }
          onSave={() => router.back()}
          onCancel={() => router.back()}
        />
      </Card>
    </Layout>
  );
}
