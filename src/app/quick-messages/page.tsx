"use client";

import { useState } from "react";

import { App, Button, Card, Popconfirm, Space, Tag, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import {
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  PlusOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import TableCustomAntd2 from "../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../components/template/Layout/Layout";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import {
  IQuickMessage,
  IQuickMessageBlock,
} from "../../shared/business/quick-messages/quick-messages.types";
import Urls from "../../shared/common/routes-app/routes-app";
import DatesEnum from "../../shared/utils/dates/dates.enum";
import { createTableState } from "../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../shared/utils/table/table-state.interface";
import QuickMessagesAccess from "./QuickMessagesAccess";
import { useFindQuickMessagesByUserTableState } from "./useFindQuickMessagesByUserTableState";

const countBlocks = (blocks: IQuickMessageBlock[]) => ({
  texts: blocks.filter((b) => b.type === QuickMessagesEnum.BlockType.TEXT)
    .length,
  files: blocks.filter((b) => b.type === QuickMessagesEnum.BlockType.MEDIA)
    .length,
});

export default function QuickMessagesPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const router = useRouter();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IQuickMessage> | undefined
  >(createTableState({ sort: { field: "name", order: "ascend" } }));

  const { isLoading, quickMessages, total, refetch } =
    useFindQuickMessagesByUserTableState(tableStateRequest);

  const toggle = async (quickMessage: IQuickMessage): Promise<void> => {
    try {
      if (quickMessage.softDelete?.isDeleted) {
        await serviceMethodsInstance.quickMessagesServiceMethods.activate(
          quickMessage._id,
        );
      } else {
        await serviceMethodsInstance.quickMessagesServiceMethods.remove(
          quickMessage._id,
        );
      }

      message.success(t("quickMessages.saved"));

      refetch();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  return (
    <Layout
      title={t("quickMessages.title")}
      subtitle={t("quickMessages.subtitle")}
      hasBackButton
    >
      <QuickMessagesAccess>
        <Card
          title={t("quickMessages.title")}
          className="h-min-80 mt-5"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push(Urls.QUICK_MESSAGES_CREATE)}
            >
              {t("quickMessages.new")}
            </Button>
          }
        >
          <TableCustomAntd2<IQuickMessage>
            rowKey={"_id"}
            dataSource={quickMessages}
            columns={[
              {
                title: t("common.name"),
                dataIndex: "name",
                key: "name",
                sorter: true,
              },
              {
                title: t("quickMessages.blocks"),
                dataIndex: "blocks",
                key: "blocks",
                align: "center",
                render: (blocks: IQuickMessageBlock[]) => {
                  const { texts, files } = countBlocks(blocks ?? []);

                  return (
                    <Space size={4}>
                      <Tag>{`${texts} ${t("quickMessages.texts")}`}</Tag>
                      <Tag icon={<FileOutlined />}>{files}</Tag>
                    </Space>
                  );
                },
              },
              {
                title: t("quickMessages.whoCanUse"),
                dataIndex: "allEmployees",
                key: "allEmployees",
                align: "center",
                render: (_: boolean, row: IQuickMessage) =>
                  row.allEmployees
                    ? t("quickMessages.allEmployees")
                    : t("quickMessages.someEmployees").replace(
                        "{count}",
                        String(row.employeesIds?.length ?? 0),
                      ),
              },
              {
                title: t("quickMessages.usageCount"),
                dataIndex: "usageCount",
                key: "usageCount",
                align: "center",
                sorter: true,
              },
              {
                title: t("quickMessages.lastUsedAt"),
                dataIndex: "lastUsedAt",
                key: "lastUsedAt",
                align: "center",
                sorter: true,
                render: (lastUsedAt: string | null) =>
                  lastUsedAt
                    ? moment(lastUsedAt).format(DatesEnum.Format.DDMMYYYYhhmmss)
                    : "-",
              },
              {
                title: t("common.status"),
                dataIndex: "softDelete",
                key: "softDelete",
                align: "center",
                render: (softDelete: IQuickMessage["softDelete"]) =>
                  softDelete?.isDeleted ? (
                    <Tag color="red">{t("common.inactive")}</Tag>
                  ) : (
                    <Tag color="green">{t("common.active")}</Tag>
                  ),
              },
              {
                title: t("common.actions"),
                dataIndex: "action",
                key: "action",
                align: "center",
                render: (_: unknown, row: IQuickMessage) => {
                  const isDeleted: boolean = !!row.softDelete?.isDeleted;

                  return (
                    <Space size={4}>
                      <Tooltip title={t("common.edit")}>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          disabled={isDeleted}
                          onClick={() =>
                            router.push(
                              Urls.QUICK_MESSAGES_EDIT.replace(
                                ":quickMessageId",
                                row._id,
                              ),
                            )
                          }
                        />
                      </Tooltip>
                      <Popconfirm
                        title={t(
                          isDeleted
                            ? "quickMessages.confirmActivate"
                            : "quickMessages.confirmDelete",
                        )}
                        onConfirm={() => toggle(row)}
                        okText={t("common.yes")}
                        cancelText={t("common.no")}
                      >
                        <Button
                          type={isDeleted ? "default" : "primary"}
                          danger={!isDeleted}
                          icon={
                            isDeleted ? <UndoOutlined /> : <DeleteOutlined />
                          }
                        />
                      </Popconfirm>
                    </Space>
                  );
                },
              },
            ]}
            search={{ placeholder: t("quickMessages.search") }}
            loading={isLoading}
            tableStateRequest={tableStateRequest}
            setTableStateRequest={setTableStateRequest}
            total={total}
          />
        </Card>
      </QuickMessagesAccess>
    </Layout>
  );
}
