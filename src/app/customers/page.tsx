"use client";

import { useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../../components/common/ImageOrDefault/ImageOrDefault";
import { PhoneNumbersTag } from "../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import { ICustomer } from "../../shared/business/customers/customer.interface";
import { IPhoneNumber } from "../../shared/business/interfaces/phone-number";
import UsersEnum from "../../shared/business/users/users.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindCustomersByOwnerOfUserTableState } from "./useFindCustomersByOwnerOfUserTableState";

export default function CustomersPage() {
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, customers, total } =
    useFindCustomersByOwnerOfUserTableState(tableStateRequest);

  const handleNewCustomer = () => {
    router.push(Urls.NEW_CUSTOMER);
  };

  const handleEditCustomer = (customer: ICustomer) => {
    router.push(Urls.EDIT_CUSTOMER.replace(":customerId", customer._id));
  };

  return (
    <Layout subtitle="Manager my Customers" title="Customers" hasBackButton>
      <Card
        title="Customers"
        className="h-min-80 mt-5"
        extra={
          <Button
            type="primary"
            onClick={handleNewCustomer}
            icon={<PlusOutlined />}
          >
            New Customer
          </Button>
        }
      >
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
                <ImageOrDefault src={avatar} width={50} />
              ),
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
                  color={
                    UsersEnum.GenderColors[gender ?? UsersEnum.Gender.OTHER]
                  }
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
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, product: ICustomer) => {
                return (
                  <>
                    <Tooltip title="Edit product">
                      <Button
                        className="mr-1"
                        type="success"
                        onClick={() => handleEditCustomer(product)}
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                  </>
                );
              },
            },
          ]}
          search={{ placeholder: "Search customers.." }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          pagination={{
            total,
            showTotal(totalCount: number, range: [number, number]) {
              return `${range[0]}-${range[1]} of ${totalCount} items`;
            },
          }}
        />
      </Card>
    </Layout>
  );
}
