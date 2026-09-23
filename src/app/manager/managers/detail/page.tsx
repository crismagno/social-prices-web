"use client";

import { useEffect, useState } from "react";

import { App, Button, Card, DatePicker, Form, Input, Select, Switch } from "antd";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import ManagerLayout from "../../../../components/template/ManagerLayout/ManagerLayout";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../../data/context/managerAuth/useManagerAuthData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { canManage } from "../../../../shared/business/managers/can-manage";
import ManagersEnum from "../../../../shared/business/managers/managers.enum";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { useFindManagerById } from "./useFindManagerById";

export default function ManagerDetailPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { manager: loggedManager, isLoading: isAuthLoading } =
    useManagerAuthData();

  const router = useRouter();

  const searchParams = useSearchParams();

  const managerId: string | null = searchParams.get("mid");

  const { isLoading, manager, loadError } = useFindManagerById(managerId);

  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEditing: boolean = !!managerId;

  const isSelf: boolean = !!manager && manager._id === loggedManager?._id;

  const isLevelLocked: boolean = isSelf || !!manager?.isMain;

  // Mirrors the grid's own gate (canEditRow / canWrite in managers/page.tsx), so a
  // pasted URL cannot reach a form that the server will refuse on submit anyway.
  const canEditTarget: boolean =
    !!manager &&
    !!loggedManager &&
    (isSelf || canManage(loggedManager.level, manager.level));

  const canCreateNew: boolean =
    !!loggedManager && loggedManager.level !== ManagersEnum.Level.SUB_MANAGER;

  const isReady: boolean = !isAuthLoading && !isLoading;

  // On the edit path, the fetch itself already knows why it failed (loadError,
  // set from the HTTP status in the hook) — trust that over re-deriving a cause
  // from a null manager, since the fetch failure is exactly why manager is null.
  // canEditTarget is only consulted when the fetch actually succeeded: a defensive
  // fallback for if the server's own read-side check is ever relaxed, not the
  // normal path today.
  const editBlockedReason: "notFound" | "forbidden" | null = loadError
    ? loadError
    : manager && !canEditTarget
      ? "forbidden"
      : null;

  // The two blocked causes are kept distinct on purpose: "not found" and
  // "cannot manage" are different diagnoses for the user, and reporting the
  // wrong one sends them to ask for access they already have.
  const blockedReason: "notFound" | "forbidden" | null = isEditing
    ? editBlockedReason
    : !canCreateNew
      ? "forbidden"
      : null;

  const isBlocked: boolean = isReady && blockedReason !== null;

  const blockedMessage: string =
    blockedReason === "notFound"
      ? t("manager.managerNotFound")
      : t("manager.cannotManageThisManager");

  // When the block came from the fetch itself, handleClientError (inside the
  // hook) already showed the server's own, more specific message — a second,
  // page-level toast here would contradict or duplicate it. The create-path
  // refusal has no fetch, so its toast is the only notification the user gets.
  const isBlockedByFetchFailure: boolean = isEditing && !!loadError;

  useEffect(() => {
    if (!isBlocked) {
      return;
    }

    if (!isBlockedByFetchFailure) {
      message.error(blockedMessage);
    }

    router.push(Urls.MANAGER_MANAGERS);
  }, [isBlocked, isBlockedByFetchFailure, blockedMessage, message, router]);

  useEffect(() => {
    if (manager) {
      form.setFieldsValue({
        name: manager.name,
        email: manager.email,
        birthDate: manager.birthDate ? dayjs(manager.birthDate) : null,
        level: manager.level,
        isActive: manager.isActive,
      });

      return;
    }

    form.setFieldsValue({
      name: "",
      email: "",
      birthDate: null,
      level: ManagersEnum.Level.SUB_MANAGER,
      isActive: true,
    });
  }, [manager, form]);

  const levelOptions = Object.keys(ManagersEnum.Level)
    .filter((level: string) => {
      // The manager's own current level is always kept in the list when the
      // field is locked (self-edit or main manager), even though canManage
      // would otherwise exclude it — without this the disabled Select shows
      // blank instead of the manager's actual level.
      if (isLevelLocked && manager && level === manager.level) {
        return true;
      }

      return loggedManager
        ? canManage(loggedManager.level, level as ManagersEnum.Level)
        : false;
    })
    .map((level: string) => ({
      value: level,
      label: t(ManagersEnum.LevelLabels[level as ManagersEnum.Level]),
    }));

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const birthDate: Date | null = values.birthDate
        ? values.birthDate.toDate()
        : null;

      if (isEditing && manager) {
        await serviceMethodsInstance.managersServiceMethods.update({
          _id: manager._id,
          name: values.name,
          birthDate,
          level: isLevelLocked ? manager.level : values.level,
          isActive: isLevelLocked ? manager.isActive : values.isActive,
        });

        message.success(t("manager.managerUpdated"));
      } else {
        await serviceMethodsInstance.managersServiceMethods.create({
          name: values.name,
          email: values.email,
          password: values.password,
          birthDate,
          level: values.level,
        });

        message.success(t("manager.managerCreated"));
      }

      router.push(Urls.MANAGER_MANAGERS);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ManagerLayout
      title={isEditing ? t("manager.editManager") : t("manager.newManager")}
      subtitle={manager?.email}
    >
      <Card className="h-min-80 max-w-2xl" loading={isLoading}>
        {isBlocked ? (
          <p className="text-sm text-gray-500">{blockedMessage}</p>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label={t("manager.name")}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label={t("manager.email")}
              rules={[{ required: true, type: "email" }]}
            >
              <Input disabled={isEditing} />
            </Form.Item>

            {!isEditing && (
              <Form.Item
                name="password"
                label={t("manager.password")}
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>
            )}

            <Form.Item name="birthDate" label={t("manager.birthDate")}>
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item name="level" label={t("manager.level")}>
              <Select options={levelOptions} disabled={isLevelLocked} />
            </Form.Item>

            {isEditing && (
              <Form.Item
                name="isActive"
                label={t("manager.isActive")}
                valuePropName="checked"
              >
                <Switch disabled={isLevelLocked} />
              </Form.Item>
            )}

            {isLevelLocked && (
              <p className="text-xs text-gray-500 mb-4">
                {manager?.isMain
                  ? t("manager.mainManagerCannotBeRemoved")
                  : t("manager.cannotChangeYourOwnAccount")}
              </p>
            )}

            <div className="flex flex-row gap-2">
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t("manager.save")}
              </Button>

              <Button onClick={() => router.push(Urls.MANAGER_MANAGERS)}>
                {t("manager.cancel")}
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </ManagerLayout>
  );
}
