"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import { Button, Card, Space, Tag, Tooltip } from "antd";
import moment from "moment";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import {
  DownloadOutlined,
  EditOutlined,
  EnterOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { ImageOrDefault } from "../../components/common/ImageOrDefault/ImageOrDefault";
import LoadingFull from "../../components/common/LoadingFull/LoadingFull";
import { PhoneNumbersTag } from "../../components/common/PhoneNumbersTag/PhoneNumbersTag";
import { TagTagsCustomAntd } from "../../components/common/TagTagsCustomAntd/TagTagsCustomAntd";
import { UploadFilesDrawer } from "../../components/common/UploadFilesDrawer/UploadFilesDrawer";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useAuthData from "../../data/context/auth/useAuthData";
import useLanguageData from "../../data/context/language/useLanguageData";
import useSocketData from "../../data/context/socket/useSocketData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IEmployee } from "../../shared/business/employees/employee.interface";
import EmployeesEnum from "../../shared/business/employees/employees.enum";
import FilesUploadsEnum from "../../shared/business/files-uploads/files-uploads.enum";
import PersonEnum from "../../shared/business/shared/person/person.enum";
import { IPhoneNumber } from "../../shared/business/shared/phone/phone-number.interface";
import SocketsEnum from "../../shared/business/sockets/sockets.enum";
import TagsEnum from "../../shared/business/tags/tags.enum";
import { ITag } from "../../shared/business/tags/tags.interface";
import Urls from "../../shared/common/routes-app/routes-app";
import { sortArray } from "../../shared/utils/array/array-functions";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import {
  FilesUploadsTable,
  IFilesUploadsTableRefProps,
} from "../files-uploads/FilesUploadsTable";
import { useFindTagsByType } from "../tags/useFindTagsByType";
import { DownloadEmployeesDrawer } from "./components/DownloadEmployeesDrawer/DownloadEmployeesDrawer";
import { useFindEmployeesByUserTableState } from "./useFindEmployeesByUserTableState";

export default function EmployeesPage() {
  const { employee, user } = useAuthData();
  const { t } = useLanguageData()!;

  const { socket } = useSocketData();

  const router: AppRouterInstance = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IEmployee> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const [isUploadFilesDrawerOpen, setIsUploadFilesDrawerOpen] =
    useState<boolean>(false);

  const [isDownloadEmployeesDrawerOpen, setIsDownloadEmployeesDrawerOpen] =
    useState<boolean>(false);

  const { isLoading, employees, total, fetchFindEmployeesByUserTableState } =
    useFindEmployeesByUserTableState(tableStateRequest);

  const filesUploadsTableRef: RefObject<IFilesUploadsTableRefProps> =
    useRef<IFilesUploadsTableRefProps>(null);

  useEffect(() => {
    if (socket && filesUploadsTableRef && user) {
      socket.on(
        SocketsEnum.EventNames.RESPONSE_UPLOAD_EMPLOYEES_FILE_TO_USER(user._id),
        async () => {
          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
          await fetchFindEmployeesByUserTableState();
        },
      );

      return () => {
        socket.off(
          SocketsEnum.EventNames.RESPONSE_UPLOAD_EMPLOYEES_FILE_TO_USER(
            user._id,
          ),
        );
      };
    }
  }, [socket, filesUploadsTableRef, user]);

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.EMPLOYEE,
  );

  if (isLoadingTags) {
    return <LoadingFull />;
  }

  const tagsSort: ITag[] = sortArray(tags, "name");

  return (
    <Layout
      subtitle={t("employees.manageMyEmployees")}
      title={t("employees.title")}
      hasBackButton
    >
      <Card
        title={t("employees.title")}
        className="h-min-80 mt-5"
        extra={
          employee?.level !== EmployeesEnum.Level.EMPLOYEE && (
            <>
              <Button
                type="primary"
                onClick={() => setIsDownloadEmployeesDrawerOpen(true)}
                className="mr-2"
                icon={<DownloadOutlined />}
              >
                {t("common.download")}
              </Button>

              <Button
                type="primary"
                onClick={() => setIsUploadFilesDrawerOpen(true)}
                className="mr-2"
                icon={<UploadOutlined />}
              >
                {t("common.upload")}
              </Button>

              <Button
                type="primary"
                onClick={() => router.push(Urls.NEW_EMPLOYEE)}
                icon={<PlusOutlined />}
              >
                {t("employees.newEmployee")}
              </Button>
            </>
          )
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
              title: t("common.name"),
              dataIndex: "name",
              key: "name",
              align: "center",
              sorter: true,
            },
            {
              title: t("employees.username"),
              dataIndex: "username",
              key: "username",
              align: "center",
              sorter: true,
            },
            {
              title: t("common.email"),
              dataIndex: "email",
              key: "email",
              align: "center",
              sorter: true,
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
                  {t(
                    PersonEnum.GenderLabels[gender ?? PersonEnum.Gender.OTHER],
                  )}
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
            {
              title: t("tags.title"),
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
              title: t("employees.level"),
              dataIndex: "level",
              key: "level",
              filters: EmployeesEnum.getLevelsByEmployeeLevel(
                employee?.level!,
              ).map((level: string) => ({
                text: t(
                  EmployeesEnum.LevelLabels[level as EmployeesEnum.Level],
                ),
                value: level,
              })),
              align: "center",
              render: (level: EmployeesEnum.Level) => (
                <Tag color={EmployeesEnum.LevelColors[level]}>
                  {t(EmployeesEnum.LevelLabels[level])}
                </Tag>
              ),
            },
            {
              title: t("common.status"),
              dataIndex: "status",
              filters: Object.keys(EmployeesEnum.Status).map(
                (status: string) => ({
                  text: t(
                    EmployeesEnum.StatusLabels[status as EmployeesEnum.Status],
                  ),
                  value: status,
                }),
              ),
              key: "status",
              align: "center",
              render: (status: EmployeesEnum.Status) => (
                <Tag color={EmployeesEnum.StatusColors[status]}>
                  {t(EmployeesEnum.StatusLabels[status])}
                </Tag>
              ),
            },
            {
              title: t("common.actions"),
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, employee: IEmployee) => {
                return (
                  <Space.Compact>
                    <Tooltip title={t("employees.editEmployee")}>
                      <Button
                        type="success"
                        onClick={() =>
                          router.push(
                            Urls.EDIT_EMPLOYEE.replace(
                              ":employeeId",
                              employee._id,
                            ),
                          )
                        }
                        icon={<EditOutlined />}
                      />
                    </Tooltip>

                    <Tooltip title={t("employees.goToEmployee")}>
                      <Button
                        type="default"
                        onClick={() =>
                          router.push(
                            Urls.EMPLOYEE.replace(":employeeId", employee._id),
                          )
                        }
                        icon={<EnterOutlined />}
                      />
                    </Tooltip>
                  </Space.Compact>
                );
              },
            },
          ]}
          search={{ placeholder: t("employees.searchEmployees") }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>

      <UploadFilesDrawer
        width={"70%"}
        isOpen={isUploadFilesDrawerOpen}
        onClose={() => setIsUploadFilesDrawerOpen(false)}
        onUploadFiles={async (formData: FormData) => {
          await serviceMethodsInstance.employeesServiceMethods.uploadEmployees(
            formData,
          );

          await filesUploadsTableRef?.current?.fetchFindFilesUploadsByUserTableState();
        }}
        downloadFileName="social-prices-employees-template.xlsx"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        title={t("employees.uploadEmployees")}
      >
        <FilesUploadsTable
          type={FilesUploadsEnum.Type.UPLOAD_EMPLOYEES}
          ref={filesUploadsTableRef}
        />
      </UploadFilesDrawer>

      <DownloadEmployeesDrawer
        isOpen={isDownloadEmployeesDrawerOpen}
        onClose={() => setIsDownloadEmployeesDrawerOpen(false)}
        title={t("employees.downloadEmployees")}
        tags={tagsSort}
      />
    </Layout>
  );
}
