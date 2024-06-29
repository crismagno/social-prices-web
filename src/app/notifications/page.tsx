"use client";

import { useEffect, useState } from "react";

import { Card, Col, List, Row, Select, Tag } from "antd";
import moment from "moment";

import ListCustomAntd from "../../components/custom/antd/ListCustomAntd/ListCustomAntd";
import Layout from "../../components/template/Layout/Layout";
import useAppData from "../../data/context/app/useAppData";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { INotification } from "../../shared/business/notifications/notification.interface";
import NotificationsEnum from "../../shared/business/notifications/notifications.enum";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindNotificationsByUserTableState } from "./useFindNotificationsByUserTableState";

export default function NotificationsPage() {
  const {
    notifications: { fetchCountNotSeenNotificationsByUser },
  } = useAppData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<INotification> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "descend" },
      pagination: { pageSize: 10, skip: 0, current: undefined, total: 0 },
    })
  );

  const { isLoading, notifications, total } =
    useFindNotificationsByUserTableState(tableStateRequest);

  useEffect(() => {
    const notificationsNotSeenIds: string[] = notifications
      .filter((notification: INotification) => !notification.isSeen)
      .map((notification: INotification) => notification._id);

    if (notificationsNotSeenIds.length > 0) {
      const updateNotificationsToSeen = async () => {
        await serviceMethodsInstance.notificationsServiceMethods.updateToSeen(
          notificationsNotSeenIds
        );

        await fetchCountNotSeenNotificationsByUser();
      };

      updateNotificationsToSeen();
    }
  }, [notifications]);

  const handleScrollList = () => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: {},
      pagination: {
        total: 0,
        current: undefined,
        pageSize: 10,
        skip: notifications.length,
      },
      useConcat: true,
    });
  };

  const onSearch = (value: string) => {
    setTableStateRequest({
      ...tableStateRequest,
      search: value?.trim(),
      pagination: {
        total: 0,
        current: undefined,
        pageSize: 10,
        skip: 0,
      },
      useConcat: false,
    });
  };

  const handleChangeType = (type: NotificationsEnum.Type | null) => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: type
        ? {
            type: [type],
          }
        : [],
      pagination: {
        total: 0,
        current: undefined,
        pageSize: 10,
        skip: 0,
      },
      useConcat: false,
    });
  };

  const renderDataItem = (notification: INotification): JSX.Element => {
    return (
      <List.Item key={notification._id}>
        <List.Item.Meta
          title={
            <>
              <div>
                {notification.title}
                <Tag
                  className="ml-2"
                  color={NotificationsEnum.TypeColors[notification.type]}
                >
                  {NotificationsEnum.TypeLabels[notification.type]}
                </Tag>
              </div>
            </>
          }
          description={
            <div className="flex flex-col">
              <div>{notification.content}</div>
              <small>
                {moment(notification.createdAt).format(
                  DatesEnum.Format.DDMMYYYYhhmmss
                )}
              </small>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <Layout subtitle="My Notifications" title="Notifications" hasBackButton>
      <Card title="Notifications" className="h-min-80 mt-5">
        <Row>
          <Col xs={24}>
            <label className="font-bold">Type: </label>
            <Select
              onChange={handleChangeType}
              className="w-52"
              placeholder="Select a Type"
            >
              <Select.Option value={null}>Select a Type</Select.Option>

              {Object.keys(NotificationsEnum.Type).map((type) => (
                <Select.Option key={type} value={type}>
                  {NotificationsEnum.TypeLabels[type as NotificationsEnum.Type]}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <ListCustomAntd
              containerHeight={600}
              data={notifications}
              handleScroll={handleScrollList}
              itemKey="_id"
              renderDataItem={renderDataItem}
              isLoading={isLoading}
              search={{ onSearch, placeholder: "Search notifications..." }}
              total={total}
            />
          </Col>
        </Row>
      </Card>
    </Layout>
  );
}
