"use client";

import { useState } from "react";

import { Card, Tag } from "antd";
import moment from "moment";

import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import ManagerLayout from "../../../components/template/ManagerLayout/ManagerLayout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import IUser from "../../../shared/business/users/user.interface";
import UsersEnum from "../../../shared/business/users/users.enum";
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
