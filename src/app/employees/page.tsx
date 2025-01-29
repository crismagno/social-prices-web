"use client";

import { useState } from "react";

import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { EditOutlined, PlusOutlined } from "@ant-design/icons";

import { ImageOrDefault } from "../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { PhoneNumbersTag } from "../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import { TagTagsCustomAntd } from "../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import { IEmployee } from "../../shared/business/employees/employee.interface";
import EmployeesEnum from "../../shared/business/employees/employees.enum";
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
import { useFindEmployeesByUserTableState } from "./useFindEmployeesByUserTableState";

export default function EmployeesPage() {
  const { employee } = useAuthData();
  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IEmployee> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, employees, total } =
    useFindEmployeesByUserTableState(tableStateRequest);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.EMPLOYEE
  );

  if (isLoadingTags) {
    return <LoadingFull />;
  }

  const tagsSort: ITag[] = sortArray(tags, "name");

  return (
    <Layout subtitle="Manager my Employees" title="Employees" hasBackButton>
      <Card
        title="Employees"
        className="h-min-80 mt-5"
        extra={
          <Button
            type="primary"
            onClick={() => router.push(Urls.NEW_EMPLOYEE)}
            icon={<PlusOutlined />}
          >
            New Employee
          </Button>
        }
      >
        <TableCustomAntd2<IEmployee>
          rowKey={"_id"}
          dataSource={employees}
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
              title: "Username",
              dataIndex: "username",
              key: "username",
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
              title: "Level",
              dataIndex: "level",
              key: "level",
              filters: EmployeesEnum.getLevelsByEmployeeLevel(
                employee?.level!
              ).map((level: string) => ({
                text: EmployeesEnum.LevelLabels[level as EmployeesEnum.Level],
                value: level,
              })),
              align: "center",
              render: (level: EmployeesEnum.Level) => (
                <Tag color={EmployeesEnum.LevelColors[level]}>
                  {EmployeesEnum.LevelLabels[level]}
                </Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              filters: Object.keys(EmployeesEnum.Status).map(
                (status: string) => ({
                  text: EmployeesEnum.StatusLabels[
                    status as EmployeesEnum.Status
                  ],
                  value: status,
                })
              ),
              key: "status",
              align: "center",
              render: (status: EmployeesEnum.Status) => (
                <Tag color={EmployeesEnum.StatusColors[status]}>
                  {EmployeesEnum.StatusLabels[status]}
                </Tag>
              ),
            },
            {
              title: "Action",
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, employee: IEmployee) => {
                return (
                  <Button.Group>
                    <Tooltip title="Edit Employee">
                      <Button
                        type="success"
                        onClick={() =>
                          router.push(
                            Urls.EDIT_EMPLOYEE.replace(
                              ":employeeId",
                              employee._id
                            )
                          )
                        }
                        icon={<EditOutlined />}
                      />
                    </Tooltip>
                  </Button.Group>
                );
              },
            },
          ]}
          search={{ placeholder: "Search employees..." }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>
    </Layout>
  );
}
