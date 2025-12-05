import { Tooltip } from "antd";

import { QuestionCircleTwoTone } from "@ant-design/icons";

import { ImageOrDefault } from "../../../../components/common/ImageOrDefault/ImageOrDefault";
import { IEmployee } from "../../../../shared/business/employees/employee.interface";
import { ISale } from "../../../../shared/business/sales/sale.interface";
import ImagesEnum from "../../../../shared/utils/images/images.enum";

interface Props {
  sale: ISale;
}

export const SaleCreatedByEmployeeCard: React.FC<Props> = ({ sale }) => {
  const employee: IEmployee | undefined = sale.createdByEmployee;

  if (!employee) {
    return null;
  }

  return (
    <Tooltip title="Sale created by employee" placement="top">
      <div className="flex items-center">
        <ImageOrDefault
          width={35}
          defaultImage={ImagesEnum.FilesNames.DefaultAvatarImage}
          src={employee.avatar}
        />
        <div className=" flex flex-col ml-2">
          <label className="font-bold mb-0">
            {employee.name} <QuestionCircleTwoTone />
          </label>
          <small className="italic mt-0">{employee.email}</small>
        </div>
      </div>
    </Tooltip>
  );
};
