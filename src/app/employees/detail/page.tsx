"use client";

import { useState } from "react";

import { Card } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Layout from "../../../components/template/Layout/Layout";
import { IEmployee } from "../../../shared/business/employees/employee.interface";
import { EmployeeEdit } from "../components/EmployeeEdit/EmployeeEdit";

export default function EmployeeDetailPage() {
  const router: AppRouterInstance = useRouter();

  const searchParams: ReadonlyURLSearchParams = useSearchParams();

  const employeeId: string | null = searchParams.get("empid");

  const [employeeToEdit, setEmployeeToEdit] = useState<IEmployee | null>();

  return (
    <Layout
      subtitle={
        employeeToEdit ? "Edit employee details" : "New employee details"
      }
      title={
        employeeToEdit
          ? `Edit employee: ${employeeToEdit?.name}`
          : "New employee"
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
