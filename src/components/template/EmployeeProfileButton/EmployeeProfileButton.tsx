"use client";

import { Tag, Tooltip } from "antd";

import useAuthData from "../../../data/context/auth/useAuthData";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import { ImageOrDefault } from "../../common/ImageOrDefault/ImageOrDefault";

export const EmployeeProfileButton: React.FC = () => {
  const { employee } = useAuthData();

  if (!employee) {
    return null;
  }

  return (
    <div
      className="flex items-center py-1 pl-1 pr-5 rounded-full border shadow-sm
      bg-gradient-to-tr from-slate-300 to bg-white text-slate-950 w-48
    "
    >
      <ImageOrDefault src={employee.avatar} />

      <div className="flex flex-col items-start justify-start ml-3 text-sm">
        <Tooltip title={employee.name}>
          <label className="w-28  truncate">{employee.name}</label>
        </Tooltip>

        <Tag color={EmployeesEnum.LevelColors[employee.level]}>
          {EmployeesEnum.LevelLabels[employee.level]}
        </Tag>
      </div>
    </div>
  );
};
