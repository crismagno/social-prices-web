"use client";

import { useEffect, useState } from "react";

import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Tag,
} from "antd";
import { useSearchParams } from "next/navigation";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import ManagerLayout from "../../../../components/template/ManagerLayout/ManagerLayout";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../../data/context/managerAuth/useManagerAuthData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import ManagersEnum from "../../../../shared/business/managers/managers.enum";
import {
  FEATURE_KEYS,
  FeatureKey,
} from "../../../../shared/business/users/user-limits.interface";
import UsersEnum from "../../../../shared/business/users/users.enum";
import { useFindUserByManagerId } from "./useFindUserByManagerId";

export default function ManagerUserDetailPage() {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { manager: loggedManager } = useManagerAuthData();

  const userId: string | null = useSearchParams().get("uid");

  const { isLoading, user, refetch } = useFindUserByManagerId(userId);

  const [userForm] = Form.useForm();

  const [limitsForm] = Form.useForm();

  const limitsValues = Form.useWatch([], limitsForm);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canEdit: boolean =
    !!loggedManager && loggedManager.level !== ManagersEnum.Level.SUB_MANAGER;

  useEffect(() => {
    if (!user) {
      return;
    }

    userForm.setFieldsValue({
      name: user.name,
      email: user.email,
      username: user.username,
      about: user.about,
      idNumber: user.idNumber,
      cpf: user.cpf,
      cnpj: user.cnpj,
      status: user.status,
      type: user.type,
    });

    limitsForm.setFieldsValue(user.limits?.features ?? {});
  }, [user, userForm, limitsForm]);

  const saveUser = async (values: any): Promise<void> => {
    if (!userId) {
      return;
    }

    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.managerUsersServiceMethods.update(userId, {
        ...values,
        birthDate: user?.birthDate,
        gender: user?.gender,
      });

      message.success(t("manager.userSaved"));

      await refetch();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveLimits = async (
    values: Partial<Record<FeatureKey, number | null>>,
  ): Promise<void> => {
    if (!userId) {
      return;
    }

    const features: Partial<Record<FeatureKey, number>> = {};

    for (const key of FEATURE_KEYS) {
      const value = values[key];

      if (typeof value === "number") {
        features[key] = value;
      }
    }

    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.managerUsersServiceMethods.updateLimits(
        userId,
        { features },
      );

      message.success(t("limits.saved"));

      await refetch();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ManagerLayout title={t("manager.editUser")} subtitle={user?.email ?? ""}>
      {!canEdit && <p className="mb-2">{t("manager.readOnly")}</p>}

      <Card loading={isLoading}>
        <Tabs
          items={[
            {
              key: "user",
              label: t("manager.userData"),
              forceRender: true,
              children: (
                <>
                  <Form
                    form={userForm}
                    layout="vertical"
                    disabled={!canEdit}
                    onFinish={saveUser}
                  >
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
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="username"
                      label={t("manager.username")}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item name="about" label={t("manager.about")}>
                      <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item name="idNumber" label={t("common.idNumber")}>
                      <Input />
                    </Form.Item>

                    <Form.Item name="cpf" label={t("common.cpf")}>
                      <Input />
                    </Form.Item>

                    <Form.Item name="cnpj" label={t("common.cnpj")}>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name="status"
                      label={t("manager.status")}
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={Object.values(UsersEnum.Status).map(
                          (value) => ({
                            value,
                            label: (
                              <Tag color={UsersEnum.StatusColors[value]}>
                                {t(UsersEnum.StatusLabels[value])}
                              </Tag>
                            ),
                          }),
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      name="type"
                      label={t("manager.type")}
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={Object.values(UsersEnum.Type).map((value) => ({
                          value,
                          label: <Tag>{t(UsersEnum.TypeLabels[value])}</Tag>,
                        }))}
                      />
                    </Form.Item>

                    {canEdit && (
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                      >
                        {t("common.save")}
                      </Button>
                    )}
                  </Form>
                </>
              ),
            },
            {
              key: "limits",
              label: t("limits.title"),
              forceRender: true,
              children: (
                <>
                  <Form
                    form={limitsForm}
                    layout="vertical"
                    disabled={!canEdit}
                    onFinish={saveLimits}
                  >
                    {FEATURE_KEYS.map((key: FeatureKey) => (
                      <Form.Item
                        key={key}
                        name={key}
                        label={t(`limits.features.${key}`)}
                        extra={
                          typeof limitsValues?.[key] === "number"
                            ? undefined
                            : t("limits.unlimited")
                        }
                      >
                        <InputNumber min={0} precision={0} className="w-full" />
                      </Form.Item>
                    ))}

                    {canEdit && (
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                      >
                        {t("limits.save")}
                      </Button>
                    )}
                  </Form>
                </>
              ),
            },
          ]}
        />
      </Card>
    </ManagerLayout>
  );
}
