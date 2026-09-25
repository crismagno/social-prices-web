"use client";

import { Fragment, useState } from "react";

import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Tag, Tooltip } from "antd";
import moment from "moment";
import Link from "next/link";

import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import ManagerLayout from "../../../components/template/ManagerLayout/ManagerLayout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import IUser from "../../../shared/business/users/user.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { useFindUsersByManagerTableState } from "./useFindUsersByManagerTableState";

export default function ManagerUsersPage() {
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IUser> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "descend" } }));

  const { isLoading, users, total } =
    useFindUsersByManagerTableState(tableStateRequest);

  return (
    <ManagerLayout
      title={t("manager.users")}
      subtitle={t("manager.usersSubtitle")}
    >
      <Card title={t("manager.users")} className="h-min-80">
        <TableCustomAntd2<IUser>
          rowKey={"_id"}
          dataSource={users}
          columns={[
            {
              title: t("manager.name"),
              dataIndex: "name",
              key: "name",
              align: "center",
              sorter: true,
              render: (name: string | null, user: IUser) => {
                const identifiers = [
                  { label: t("common.cpf"), value: user.cpf },
                  { label: t("common.cnpj"), value: user.cnpj },
                  { label: t("common.idNumber"), value: user.idNumber },
                ].filter((identifier) => !!identifier.value?.trim());

                return (
                  <div className="flex flex-col items-center">
                    <Link
                      href={Urls.MANAGER_EDIT_USER.replace(":userId", user._id)}
                    >
                      {name || "-"}
                    </Link>

                    {identifiers.length > 0 && (
                      <span className="text-[11px] leading-tight italic text-gray-400 dark:text-gray-500">
                        {identifiers.map((identifier, index) => (
                          <Fragment key={identifier.label}>
                            {index > 0 && " | "}
                            <Tooltip title={identifier.label}>
                              <span className="cursor-help">
                                {identifier.value}
                              </span>
                            </Tooltip>
                          </Fragment>
                        ))}
                      </span>
                    )}
                  </div>
                );
              },
            },
            {
              title: t("manager.username"),
              dataIndex: "username",
              key: "username",
              align: "center",
              sorter: true,
            },
            {
              title: t("manager.email"),
              dataIndex: "email",
              key: "email",
              align: "center",
              sorter: true,
            },
            {
              title: t("manager.status"),
              dataIndex: "status",
              key: "status",
              align: "center",
              filters: Object.keys(UsersEnum.Status).map((status: string) => ({
                text: t(UsersEnum.StatusLabels[status as UsersEnum.Status]),
                value: status,
              })),
              render: (status: UsersEnum.Status) => (
                <Tag color={UsersEnum.StatusColors[status]}>
                  {t(UsersEnum.StatusLabels[status])}
                </Tag>
              ),
            },
            {
              title: t("manager.type"),
              dataIndex: "type",
              key: "type",
              align: "center",
              filters: Object.keys(UsersEnum.Type).map((type: string) => ({
                text: t(UsersEnum.TypeLabels[type as UsersEnum.Type]),
                value: type,
              })),
              render: (type: UsersEnum.Type) => (
                <Tag>{t(UsersEnum.TypeLabels[type])}</Tag>
              ),
            },
            {
              title: t("manager.createdAt"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              sorter: true,
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
            },
            {
              title: t("common.actions"),
              key: "actions",
              align: "center",
              render: (_: unknown, user: IUser) => (
                <Link
                  href={Urls.MANAGER_EDIT_USER.replace(":userId", user._id)}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined />}
                    aria-label={t("common.edit")}
                  />
                </Link>
              ),
            },
          ]}
          search={{ placeholder: t("manager.searchUsers") }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>
    </ManagerLayout>
  );
}
