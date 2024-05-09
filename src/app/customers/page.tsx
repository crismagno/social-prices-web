"use client";

import { useState } from "react";

import { Button, Card, Image, TablePaginationConfig, Tag, Tooltip } from "antd";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";
import { RecordType } from "zod";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import TableCustomAntd from "../../components/custom/antd/TableCustomAntd/TableCustomAntd";
import Layout from "../../components/template/Layout/Layout";
import { ICustomer } from "../../shared/business/customers/customer.interface";
import UsersEnum from "../../shared/business/users/users.enum";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { defaultAvatarImage } from "../../shared/utils/images/files-names";
import { getImageUrl } from "../../shared/utils/images/url-images";
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

  const onSearch = (value: string) => {
    setTableStateRequest({ ...tableStateRequest, search: value?.trim() });
  };

  const handleChangeTable = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>
  ) => {
    setTableStateRequest({
      ...tableStateRequest,
      filters,
      pagination,
      sort: {
        field: sorter.field ?? "createdAt",
        order: sorter.order ?? "ascend",
      },
      action: extra.action,
    });
  };

  return (
    <Layout subtitle="Manager my Customers" title="Customers" hasBackButton>
      <Card
        title="Customers"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={handleNewCustomer}
              icon={<PlusOutlined />}
            >
              New Customer
            </Button>
          </>
        }
      >
        <TableCustomAntd<ICustomer>
          rowKey={"_id"}
          onChange={handleChangeTable}
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
          search={{ onSearch, placeholder: "Search customers.." }}
          loading={isLoading}
          pagination={{
            total,
          }}
        />
      </Card>
    </Layout>
  );
}
