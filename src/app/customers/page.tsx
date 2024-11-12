"use client";

import { useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import {
  EditOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { ImageOrDefault } from "../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { PhoneNumbersTag } from "../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import { TagTagsCustomAntd } from "../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../components/common/UploadFilesDrawer/UploadFilesDrawer";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { ICustomer } from "../../shared/business/customers/customer.interface";
import PersonEnum from "../../shared/business/enums/person.enum";
import { IPhoneNumber } from "../../shared/business/interfaces/phone-number.interface";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import { sortArray } from "../../shared/utils/array/functions";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindTagsByType } from "../tags/useFindTagsByType";
import { useFindCustomersByOwnerOfUserTableState } from "./useFindCustomersByOwnerOfUserTableState";

export default function CustomersPage() {
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomer> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, customers, total } =
    useFindCustomersByOwnerOfUserTableState(tableStateRequest);

  const [isUploadFilesDrawerOpen, setIsUploadFilesDrawerOpen] =
    useState<boolean>(false);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.CUSTOMER
  );

  if (isLoadingTags) {
    return <LoadingFull />;
  }

  const tagsSort: ITag[] = sortArray(tags, "name");

  return (
    <Layout subtitle="Manager my Customers" title="Customers" hasBackButton>
      <Card
        title="Customers"
        className="h-min-80 mt-5"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => setIsUploadFilesDrawerOpen(true)}
              className="mr-2"
              icon={<UploadOutlined />}
            >
              Upload
            </Button>

            <Button
              type="primary"
              onClick={() => router.push(Urls.NEW_CUSTOMER)}
              icon={<PlusOutlined />}
            >
              New Customer
            </Button>
          </>
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
              filters: Object.keys(PersonEnum.Gender).map((gender: string) => ({
                text: PersonEnum.GenderLabels[gender as PersonEnum.Gender],
                value: gender,
              })),
              render: (gender: PersonEnum.Gender | null) => (
                <Tag
                  color={
                    PersonEnum.GenderColors[gender ?? PersonEnum.Gender.OTHER]
                  }
                >
                  {PersonEnum.GenderLabels[gender ?? PersonEnum.Gender.OTHER]}
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
              title: "Tags",
              dataIndex: "tagsIds",
              key: "tagsIds",
              filters: tagsSort.map((tag: ITag) => ({
                text: tag.name,
                value: tag._id,
              })),
              align: "center",
              render: (tagsIds: string[]) => (
                <TagTagsCustomAntd tags={tagsSort} tagsIds={tagsIds} />
              ),
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, customer: ICustomer) => {
                return (
                  <Button.Group>
                    <Tooltip title="Edit Customer">
                      <Button
                        type="success"
                        onClick={() =>
                          router.push(
                            Urls.EDIT_CUSTOMER.replace(
                              ":customerId",
                              customer._id
                            )
                          )
                        }
                        icon={<EditOutlined />}
                      />
                    </Tooltip>

                    <Tooltip title="Create Sale">
                      <Button
                        type="primary"
                        onClick={() =>
                          router.push(
                            Urls.SALES_CREATE_BY_CUSTOMER.replace(
                              ":customerId",
                              customer._id
                            )
                          )
                        }
                        icon={<ShoppingCartOutlined />}
                      />
                    </Tooltip>
                  </Button.Group>
                );
              },
            },
          ]}
          search={{ placeholder: "Search customers..." }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>

      <UploadFilesDrawer
        isOpen={isUploadFilesDrawerOpen}
        onClose={() => setIsUploadFilesDrawerOpen(false)}
        onUploadFiles={async (formData: FormData) =>
          await serviceMethodsInstance.customersServiceMethods.uploadCustomers(
            formData
          )
        }
        downloadFileName="social-prices-customers-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title="Upload Customers"
      />
    </Layout>
  );
}
