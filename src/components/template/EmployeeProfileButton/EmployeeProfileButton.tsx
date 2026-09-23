"use client";

import { useState } from "react";

import { Avatar, Tag, Tooltip } from "antd";

import { EmployeeEditDrawer } from "../../../app/employees/components/EmployeeEditDrawer/DownloadEmployeesDrawer";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IEmployee } from "../../../shared/business/employees/employee.interface";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";

interface Props {
  isCollapsed?: boolean;
}

export const EmployeeProfileButton: React.FC<Props> = ({ isCollapsed }) => {
  const { employee, updateEmployeeSession } = useAuthData();
  const { t } = useLanguageData();

  const [isEmployeeEditDrawerOpen, setIsEmployeeEditDrawerOpen] =
    useState<boolean>(false);

  const [avatar, setAvatar] = useState<string>(
    employee?.avatar
      ? getImageUrl(employee.avatar)
      : ImagesEnum.FilesNames.DefaultAvatarImage
  );

  if (!employee) {
    return null;
  }

  return (
    <>
      <div
        className={`flex items-center rounded-full border shadow-sm cursor-pointer
        bg-gradient-to-tr from-white to-slate-100 text-slate-950
        hover:from-slate-100 hover:to-slate-200
        ${isCollapsed ? "justify-center p-1" : "py-1 pl-1 pr-5 w-full"}`}
        onClick={() => setIsEmployeeEditDrawerOpen(true)}
      >
        <Tooltip title={isCollapsed ? employee.name : undefined}>
          <Avatar
            src={avatar}
            onError={() =>
              setAvatar(ImagesEnum.FilesNames.DefaultAvatarImage) as any
            }
            size={isCollapsed ? "default" : "large"}
          />
        </Tooltip>

        {!isCollapsed && (
          <div className="flex flex-col items-start justify-start ml-3 text-sm overflow-hidden">
            <Tooltip title={employee.name} className="cursor-pointer">
              <label className="w-28 truncate cursor-pointer">
                {employee.name}
              </label>
            </Tooltip>

            <Tag color={EmployeesEnum.LevelColors[employee.level]}>
              {t(EmployeesEnum.LevelLabels[employee.level])}
            </Tag>
          </div>
        )}
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
