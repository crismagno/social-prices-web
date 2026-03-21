import { useState } from 'react';

import {
  Card,
  Tag,
} from 'antd';
import moment from 'moment';

import {
  ButtonCreateSale,
} from '../../../../components/common/ButtonCreateSale/ButtonCreateSale';
import {
  ImageOrDefault,
} from '../../../../components/common/ImageOrDefault/ImageOrDefault';
import {
  PhoneNumbersTag,
} from '../../../../components/common/PhoneNumbersTag/PhoneNumbersTag';
import TableCustomAntd2
  from '../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2';
import useLanguageData from '../../../../data/context/language/useLanguageData';
import {
  ICustomer,
} from '../../../../shared/business/customers/customer.interface';
import PersonEnum from '../../../../shared/business/shared/person/person.enum';
import {
  IPhoneNumber,
} from '../../../../shared/business/shared/phone/phone-number.interface';
import DatesEnum from '../../../../shared/utils/dates/dates.enum';
import { createTableState } from '../../../../shared/utils/table/table-state';
import {
  ITableStateRequest,
} from '../../../../shared/utils/table/table-state.interface';
import {
  useFindCustomersByOwnerOfUserTableState,
} from '../../../customers/useFindCustomersByOwnerOfUserTableState';

export const CustomersDashboardTable: React.FC = () => {
  const { t } = useLanguageData();
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, customers, total } =
    useFindCustomersByOwnerOfUserTableState(tableStateRequest);

  return (
    <Card className="h-min-80 mt-3" extra={<ButtonCreateSale />}>
      <TableCustomAntd2<ICustomer>
        rowKey={"_id"}
        dataSource={customers}
        columns={[
          {
            title: "#",
            dataIndex: "avatar",
            key: "avatar",
            align: "center",
            render: (avatar: string | null) => (
              <ImageOrDefault
                className="rounded-full"
                width={50}
                src={avatar}
              />
            ),
          },
          {
            title: t("common.name"),
            dataIndex: "name",
            key: "name",
            align: "center",
          },
          {
            title: t("common.email"),
            dataIndex: "email",
            key: "email",
            align: "center",
            render: (email: string) => (
              <a href={`mailto:${email}`} className="text-blue-500">
                {email}
              </a>
            ),
          },
          {
            title: t("profile.phoneNumbers"),
            dataIndex: "phoneNumbers",
            key: "phoneNumbers",
            align: "center",
            render: (phoneNumbers: IPhoneNumber[]) => (
              <PhoneNumbersTag phoneNumbers={phoneNumbers} />
            ),
          },
          {
            title: t("customers.gender"),
            dataIndex: "gender",
            key: "gender",
            align: "center",
            filters: Object.keys(PersonEnum.Gender).map((gender: string) => ({
              text: t(PersonEnum.GenderLabels[gender as PersonEnum.Gender]),
              value: gender,
            })),
            render: (gender: PersonEnum.Gender | null) => (
              <Tag
                color={
                  PersonEnum.GenderColors[gender ?? PersonEnum.Gender.OTHER]
                }
              >
                {t(PersonEnum.GenderLabels[gender ?? PersonEnum.Gender.OTHER])}
              </Tag>
            ),
          },
          {
            title: t("customers.birthDate"),
            dataIndex: "birthDate",
            key: "birthDate",
            align: "center",
            sorter: true,
            render: (birthDate: Date) =>
              moment(birthDate).format(DatesEnum.Format.DDMMYYY),
          },
        ]}
        search={{ placeholder: t("customers.searchCustomers") }}
        loading={isLoading}
        tableStateRequest={tableStateRequest}
        setTableStateRequest={setTableStateRequest}
        total={total}
      />
    </Card>
  );
};
