import { useState } from "react";

import { Card, Image, Tag } from "antd";
import moment from "moment";

import { PhoneNumbersTag } from "../../../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import TableCustomAntd2 from "../../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import { ICustomer } from "../../../../shared/business/customers/customer.interface";
import { IPhoneNumber } from "../../../../shared/business/interfaces/phone-number";
import UsersEnum from "../../../../shared/business/users/users.enum";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../../../shared/utils/images/files-names";
import { getImageUrl } from "../../../../shared/utils/images/url-images";
import { createTableState } from "../../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../../shared/utils/table/table-state.interface";
import { useFindCustomersByOwnerOfUserTableState } from "../../../customers/useFindCustomersByOwnerOfUserTableState";

export const CustomersDashboardTable: React.FC = () => {
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, customers, total } =
    useFindCustomersByOwnerOfUserTableState(tableStateRequest);

  return (
    <Card className="h-min-80 mt-5">
      <TableCustomAntd2<ICustomer>
        rowKey={"_id"}
        dataSource={customers}
        columns={[
          {
            title: "#",
            dataIndex: "avatar",
            key: "avatar",
            align: "center",
            render: (avatar: string | null) => {
              if (!avatar) {
                return (
                  <Image
                    width={50}
                    height={50}
                    src={defaultAvatarImage}
                    alt="mainUrl"
                    className="rounded-full"
                  />
                );
              }

              return (
                <Image
                  width={50}
                  height={50}
                  src={getImageUrl(avatar)}
                  alt="mainUrl"
                  className="rounded-full"
                />
              );
            },
          },
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
            align: "center",
          },
          {
            title: "Email",
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
            title: "Phone Numbers",
            dataIndex: "phoneNumbers",
            key: "phoneNumbers",
            align: "center",
            render: (phoneNumbers: IPhoneNumber[]) => (
              <PhoneNumbersTag phoneNumbers={phoneNumbers} />
            ),
          },
          {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            align: "center",
            filters: Object.keys(UsersEnum.Gender).map((gender: string) => ({
              text: UsersEnum.GenderLabels[gender as UsersEnum.Gender],
              value: gender,
            })),
            render: (gender: UsersEnum.Gender | null) => (
              <Tag
                color={UsersEnum.GenderColors[gender ?? UsersEnum.Gender.OTHER]}
              >
                {UsersEnum.GenderLabels[gender ?? UsersEnum.Gender.OTHER]}
              </Tag>
            ),
          },
          {
            title: "Birth Date",
            dataIndex: "birthDate",
            key: "birthDate",
            align: "center",
            sorter: true,
            render: (birthDate: Date) =>
              moment(birthDate).format(DatesEnum.Format.DDMMYYY),
          },
        ]}
        search={{ placeholder: "Search customers.." }}
        loading={isLoading}
        tableStateRequest={tableStateRequest}
        setTableStateRequest={setTableStateRequest}
        pagination={{
          total,
        }}
      />
    </Card>
  );
};
