"use client";

import { useState } from "react";

import { Card, TablePaginationConfig, Tag } from "antd";
import {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import moment from "moment";
import { RecordType } from "zod";

import TableCustomAntd from "../../components/custom/antd/TableCustomAntd/TableCustomAntd";
import Layout from "../../components/template/Layout/Layout";
import { INotification } from "../../shared/business/notifications/notification.interface";
import NotificationsEnum from "../../shared/business/notifications/notifications.enum";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindNotificationsByUserTableState } from "./useFindNotificationsByUserTableState";

export default function NotificationsPage() {
  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<INotification> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "ascend" } }));

  const { isLoading, notifications, total } =
    useFindNotificationsByUserTableState(tableStateRequest);

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
    <Layout subtitle="My Notifications" title="Notifications" hasBackButton>
      <Card title="Notifications" className="h-min-80 mt-5">
        <TableCustomAntd<INotification>
          rowKey={"_id"}
          onChange={handleChangeTable}
          dataSource={notifications}
          columns={[
            {
              title: "Title",
              dataIndex: "title",
              key: "title",
              align: "center",
              render: (title: string) => <b>{title}</b>,
            },
            {
              title: "Subtitle",
              dataIndex: "subtitle",
              key: "subtitle",
              align: "center",
            },
            {
              title: "Content",
              dataIndex: "content",
              key: "content",
              align: "center",
            },
            {
              title: "Type",
              dataIndex: "type",
              key: "type",
              align: "center",
              render: (type: NotificationsEnum.Type) => (
                <Tag color={NotificationsEnum.TypeColors[type]}>
                  {NotificationsEnum.TypeLabels[type]}
                </Tag>
              ),
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
            {
              title: "Updated At",
              dataIndex: "updatedAt",
              key: "updatedAt",
              align: "center",
              render: (updatedAt: Date) =>
                moment(updatedAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
              sorter: true,
            },
          ]}
          search={{ onSearch, placeholder: "Search notifications.." }}
          loading={isLoading}
          pagination={{
            total,
          }}
        />
      </Card>
    </Layout>
  );
}
