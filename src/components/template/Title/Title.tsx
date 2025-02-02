import { ReactElement } from "react";

import { Divider } from "antd";

import { BackButton } from "../../common/BackButton/BackButton";
import { EmployeeProfileButton } from "../EmployeeProfileButton/EmployeeProfileButton";

interface Props {
  title: string | ReactElement;
  subtitle?: string;
  hasBackButton?: boolean;
  hasEmployeeProfileButton?: boolean;
}

const Title: React.FC<Props> = ({
  subtitle,
  title,
  hasBackButton,
  hasEmployeeProfileButton = true,
}) => {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="font-black text-3xl text-gray-800 dark:text-gray-100">
          {title}
        </h1>

        {subtitle && (
          <h2 className="font-light text-sm text-gray-600 dark:text-gray-200">
            {subtitle}
          </h2>
        )}
      </div>

      <div className="flex items-center">
        {hasEmployeeProfileButton && <EmployeeProfileButton />}

        {hasEmployeeProfileButton && hasBackButton && (
          <Divider type="vertical" />
        )}

        {hasBackButton && (
          <div>
            <BackButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default Title;
