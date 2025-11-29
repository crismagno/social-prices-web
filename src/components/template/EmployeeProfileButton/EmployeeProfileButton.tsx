"use client";

import { useState } from "react";

import { Avatar, Tag, Tooltip } from "antd";

import { EmployeeEditDrawer } from "../../../app/employees/components/EmployeeEditDrawer/DownloadEmployeesDrawer";
import useAuthData from "../../../data/context/auth/useAuthData";
import { IEmployee } from "../../../shared/business/employees/employee.interface";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import { defaultAvatarImage } from "../../../shared/utils/images/files-names";

export const EmployeeProfileButton: React.FC = () => {
  const { employee, updateEmployeeSession } = useAuthData();

  const [isEmployeeEditDrawerOpen, setIsEmployeeEditDrawerOpen] =
    useState<boolean>(false);

  const [avatar, setAvatar] = useState<string>(
    employee?.avatar ?? defaultAvatarImage
  );

  if (!employee) {
    return null;
  }

  return (
    <>
      <div
        className="flex items-center py-1 pl-1 pr-5 rounded-full border shadow-sm
        bg-gradient-to-tr from-white to-slate-100  text-slate-950 hover:from-slate-100 hover:to-slate-200 w-48 
        cursor-pointer
    "
        onClick={() => setIsEmployeeEditDrawerOpen(true)}
      >
        <Avatar
          src={avatar}
          onError={() => setAvatar(defaultAvatarImage) as any}
          size="large"
        />

        <div className="flex flex-col items-start justify-start ml-3 text-sm">
          <Tooltip title={employee.name} className="cursor-pointer">
            <label className="w-28  truncate">{employee.name}</label>
          </Tooltip>

          <Tag color={EmployeesEnum.LevelColors[employee.level]}>
            {EmployeesEnum.LevelLabels[employee.level]}
          </Tag>
        </div>
      </div>

      <EmployeeEditDrawer
        employeeId={employee._id}
        isOpen={isEmployeeEditDrawerOpen}
        title={employee.name}
        onCancel={() => setIsEmployeeEditDrawerOpen(false)}
        onSave={(newEmployee: IEmployee) => {
          setIsEmployeeEditDrawerOpen(false);
          updateEmployeeSession(newEmployee);
        }}
        isFromProfile
      />
    </>
  );
};
