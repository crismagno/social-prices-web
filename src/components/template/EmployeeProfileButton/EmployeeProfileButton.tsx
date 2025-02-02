"use client";

import { Tag } from "antd";

import useAuthData from "../../../data/context/auth/useAuthData";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import { ImageOrDefault } from "../../common/ImageOrDefault/ImageOrDefault";

export const EmployeeProfileButton: React.FC = () => {
  const { employee } = useAuthData();

  if (!employee) {
    return null;
  }

  return (
    <div className="flex items-center text-slate-950 bg-white py-1 pl-1 pr-5 rounded-full border">
      <ImageOrDefault src={employee.avatar} />

      <div className="flex flex-col items-start justify-start ml-3 text-sm">
        <label>{employee.name}</label>

        <Tag color={EmployeesEnum.LevelColors[employee.level]}>
          {EmployeesEnum.LevelLabels[employee.level]}
        </Tag>
      </div>
    </div>
  );
};
