"use client";

import { useMemo, useState } from "react";

import { App, Button, Card, Input, Modal, Switch, Tag, Tooltip } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import ManagerLayout from "../../../components/template/ManagerLayout/ManagerLayout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../data/context/managerAuth/useManagerAuthData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { canManage } from "../../../shared/business/managers/can-manage";
import { IManager } from "../../../shared/business/managers/manager.interface";
import ManagersEnum from "../../../shared/business/managers/managers.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import { useFindManagersByTableState } from "./useFindManagersByTableState";

export default function ManagersPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { manager } = useManagerAuthData();

  const router = useRouter();

  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<IManager> | undefined
  >(
    createTableState({
      sort: { field: "createdAt", order: "ascend" },
    }),
  );

  const tableStateRequestWithDeleted = useMemo(
    () => ({
      ...tableStateRequest,
      filters: { ...tableStateRequest?.filters, isDeleted: showDeleted },
    }),
    [tableStateRequest, showDeleted],
  );

  const { isLoading, managers, total, fetchFindManagersByTableState } =
    useFindManagersByTableState(tableStateRequestWithDeleted);

  const [managerToDelete, setManagerToDelete] = useState<IManager | null>(null);

  const [deleteReason, setDeleteReason] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canWrite: boolean =
    !!manager && manager.level !== ManagersEnum.Level.SUB_MANAGER;

  const canEditRow = (row: IManager): boolean => {
    if (!manager) {
      return false;
    }

    if (row._id === manager._id) {
      return true;
    }

    return canManage(manager.level, row.level);
  };

  const canDeleteRow = (row: IManager): boolean => {
    if (!manager || row.isMain || row._id === manager._id) {
      return false;
    }

    return canManage(manager.level, row.level);
  };

  const canRestoreRow = (row: IManager): boolean =>
    !!manager && canManage(manager.level, row.level);

  const handleToggleShowDeleted = (checked: boolean) => {
    setShowDeleted(checked);

    setTableStateRequest({
      ...tableStateRequest,
      pagination: { ...tableStateRequest?.pagination, current: 1 },
    });
  };

  const handleDelete = async () => {
    if (!managerToDelete) {
      return;
    }

    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.managersServiceMethods.deleteManual(
        managerToDelete._id,
        deleteReason.trim() || null,
      );

      message.success(t("manager.managerDeleted"));

      setManagerToDelete(null);
      setDeleteReason("");

      await fetchFindManagersByTableState();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (row: IManager) => {
    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.managersServiceMethods.activateManual(
        row._id,
      );

      message.success(t("manager.managerRestored"));

      await fetchFindManagersByTableState();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ManagerLayout
      title={t("manager.managers")}
      subtitle={t("manager.managersSubtitle")}
    >
      <Card
        title={t("manager.managers")}
        className="h-min-80"
        extra={
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm">{t("manager.showDeleted")}</span>

              <Switch
                checked={showDeleted}
                onChange={handleToggleShowDeleted}
              />
            </div>

            {canWrite && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push(Urls.MANAGER_NEW_MANAGER)}
              >
                {t("manager.newManager")}
              </Button>
            )}
          </div>
        }
      >
        <TableCustomAntd2<IManager>
          rowKey={"_id"}
          dataSource={managers}
          columns={[
            {
              title: t("manager.name"),
              dataIndex: "name",
              key: "name",
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
              title: t("manager.level"),
              dataIndex: "level",
              key: "level",
              align: "center",
              filters: Object.keys(ManagersEnum.Level).map((level: string) => ({
                text: t(ManagersEnum.LevelLabels[level as ManagersEnum.Level]),
                value: level,
              })),
              render: (level: ManagersEnum.Level, row: IManager) => (
                <>
                  <Tag color={ManagersEnum.LevelColors[level]}>
                    {t(ManagersEnum.LevelLabels[level])}
                  </Tag>

                  {row.isMain && <Tag color="gold">{t("manager.isMain")}</Tag>}
                </>
              ),
            },
            {
              title: t("manager.isActive"),
              dataIndex: "isActive",
              key: "isActive",
              align: "center",
              render: (isActive: boolean) => (
                <Tag color={isActive ? "success" : "gray"}>
                  {isActive ? t("manager.yes") : t("manager.no")}
                </Tag>
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
              title: t("manager.action"),
              dataIndex: "action",
              key: "action",
              align: "center",
              render: (_: any, row: IManager) => (
                <div className="flex flex-row justify-center gap-1">
                  <Tooltip
                    title={
                      canEditRow(row)
                        ? t("manager.editManager")
                        : t("manager.cannotManageThisManager")
                    }
                  >
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      disabled={!canEditRow(row)}
                      onClick={() =>
                        router.push(
                          Urls.MANAGER_EDIT_MANAGER.replace(
                            ":managerId",
                            row._id,
                          ),
                        )
                      }
                    />
                  </Tooltip>

                  {!row.isDeleted && (
                    <Tooltip
                      title={
                        row.isMain
                          ? t("manager.mainManagerCannotBeRemoved")
                          : canDeleteRow(row)
                            ? t("manager.deleteManager")
                            : t("manager.cannotManageThisManager")
                      }
                    >
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={!canDeleteRow(row)}
                        onClick={() => {
                          setDeleteReason("");
                          setManagerToDelete(row);
                        }}
                      />
                    </Tooltip>
                  )}

                  {row.isDeleted && (
                    <Tooltip
                      title={
                        canRestoreRow(row)
                          ? t("manager.restoreManager")
                          : t("manager.cannotManageThisManager")
                      }
                    >
                      <Button
                        icon={<UndoOutlined />}
                        disabled={!canRestoreRow(row) || isSubmitting}
                        onClick={() => handleRestore(row)}
                      />
                    </Tooltip>
                  )}
                </div>
              ),
            },
          ]}
          search={{ placeholder: t("manager.searchManagers") }}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
        />
      </Card>

      <Modal
        open={!!managerToDelete}
        title={t("manager.deleteManager")}
        destroyOnHidden
        okText={t("manager.yes")}
        cancelText={t("manager.no")}
        confirmLoading={isSubmitting}
        onCancel={() => setManagerToDelete(null)}
        onOk={handleDelete}
      >
        <p className="mb-3">{t("manager.deleteManagerConfirm")}</p>

        <Input
          placeholder={t("manager.deleteReason")}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />
      </Modal>
    </ManagerLayout>
  );
}
