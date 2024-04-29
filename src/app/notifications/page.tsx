"use client";

import { useEffect, useState } from "react";

import { Button, Card, List, Tag } from "antd";
import moment from "moment";
import VirtualList from "rc-virtual-list";

import Layout from "../../components/template/Layout/Layout";
import useAppData from "../../data/context/app/useAppData";
import { serviceMethodsInstance } from "../../services/social-prices-api/ServiceMethods";
import { INotification } from "../../shared/business/notifications/notification.interface";
import NotificationsEnum from "../../shared/business/notifications/notifications.enum";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import { useFindNotificationsByUserTableState } from "./useFindNotificationsByUserTableState";

const containerHeight: number = 600;

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

  const { isLoading, notifications } = useFindNotificationsByUserTableState(
    tableStateRequest,
    true
  );

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

  const handleChangeTable = () => {
    setTableStateRequest({
      ...tableStateRequest,
      filters: {},
      pagination: {
        total: 0,
        current: undefined,
        pageSize: 10,
        skip: notifications.length,
      },
    });
  };

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          containerHeight
      ) <= 1
    ) {
      handleChangeTable();
    }
  };

  return (
    <Layout subtitle="My Notifications" title="Notifications" hasBackButton>
      <Card title="Notifications" className="h-min-80 mt-5">
        <List loading={isLoading}>
          <VirtualList
            data={notifications}
            height={containerHeight}
            itemHeight={50}
            itemKey="_id"
            onScroll={onScroll}
          >
            {(notification: INotification) => (
              <List.Item key={notification._id}>
                <List.Item.Meta
                  title={
                    <>
                      <div>
                        {notification.title}
                        <Tag
                          className="ml-2"
                          color={
                            NotificationsEnum.TypeColors[notification.type]
                          }
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
            )}
          </VirtualList>

          <div className="flex justify-center">
            <Button onClick={handleChangeTable} loading={isLoading}>
              Load More
            </Button>
          </div>
        </List>
      </Card>
    </Layout>
  );
}
