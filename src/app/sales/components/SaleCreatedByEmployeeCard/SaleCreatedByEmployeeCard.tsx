import {
  Button,
  Tooltip,
} from 'antd';

import useLanguageData from '../../../../data/context/language/useLanguageData';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import { QuestionCircleTwoTone } from '@ant-design/icons';

import {
  ImageOrDefault,
} from '../../../../components/common/ImageOrDefault/ImageOrDefault';
import {
  IEmployee,
} from '../../../../shared/business/employees/employee.interface';
import { ISale } from '../../../../shared/business/sales/sale.interface';
import Urls from '../../../../shared/common/routes-app/routes-app';
import ImagesEnum from '../../../../shared/utils/images/images.enum';

interface Props {
  sale: ISale;
}

export const SaleCreatedByEmployeeCard: React.FC<Props> = ({ sale }) => {
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  const employee: IEmployee | undefined = sale.createdByEmployee;

  if (!employee) {
    return null;
  }

  return (
    <Tooltip title={t("sales.saleCreatedByEmployee")} placement="top">
      <div className="flex items-center">
        <ImageOrDefault
          width={35}
          defaultImage={ImagesEnum.FilesNames.DefaultAvatarImage}
          src={employee.avatar}
        />

        <div className=" flex flex-col ml-2">
          <Button
            type="link"
            className="pl-0"
            onClick={() =>
              router.push(Urls.EMPLOYEE.replace(":employeeId", employee._id))
            }
          >
            {employee.name} <QuestionCircleTwoTone />
          </Button>
          <small className="italic">{employee.email}</small>
        </div>
      </div>
    </Tooltip>
  );
};
