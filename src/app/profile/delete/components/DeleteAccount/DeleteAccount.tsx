"use client";

import { useMemo, useState } from "react";

import { Alert, Button, message } from "antd";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";

import ContainerTitle from "../../../../../components/common/ContainerTitle/ContainerTitle";
import handleClientError from "../../../../../components/common/HandleClientError/HandleClientError";
import { ImageOrDefault } from "../../../../../components/common/ImageOrDefault/ImageOrDefault";
import { CheckboxCustomAntd } from "../../../../../components/custom/antd/CheckboxCustomAntd/CheckboxCustomAntd";
import { TextareaCustomAntd } from "../../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import useAuthData from "../../../../../data/context/auth/useAuthData";
import useLanguageData from "../../../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../../../services/social-prices-api/service-methods";

const _baseFormSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You should confirm to continue." }),
  }),
  reason: z.string().optional(),
});

type TFormSchema = z.infer<typeof _baseFormSchema>;

const DeleteAccount: React.FC = () => {
  const { logout, user } = useAuthData();
  const { t } = useLanguageData()!;

  const formSchema = useMemo(
    () =>
      z.object({
        confirm: z.literal(true, {
          errorMap: () => ({
            message: t("errors.confirmRequired"),
          }),
        }),
        reason: z.string().optional(),
      }),
    [t],
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TFormSchema>({
    defaultValues: { confirm: undefined as any, reason: "" },
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isConfirmed = watch("confirm");

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      await serviceMethodsInstance.usersServiceMethods.removeAccount(
        data.reason ?? null,
      );

      message.success(t("profile.deleteAccountSuccess"));

      await logout();
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex justify-center my-10">
        <ImageOrDefault src={user?.avatar} width={200} />
      </div>
      <ContainerTitle title={t("profile.deleteAccount")} className="mt-10">
        <Alert
          className="mb-6"
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message={t("profile.deleteAccountWarningTitle")}
          description={
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>{t("profile.deleteAccountWarning1")}</li>
              <li>{t("profile.deleteAccountWarning2")}</li>
              <li>{t("profile.deleteAccountWarning3")}</li>
              <li>{t("profile.deleteAccountWarning4")}</li>
              <li>{t("profile.deleteAccountWarning5")}</li>
            </ul>
          }
        />

        <TextareaCustomAntd
          controller={{ control, name: "reason" }}
          label={t("profile.deleteAccountReason")}
          errorMessage={errors.reason?.message}
          placeholder={t("profile.deleteEnterReason")}
          rows={3}
        />

        <div className="flex mt-4">
          <CheckboxCustomAntd
            controller={{ control, name: "confirm" }}
            errorMessage={errors.confirm?.message}
            divClassName="mt-0 mr-2"
          />
          <span>{t("profile.deleteAccountConfirmLabel")}</span>
        </div>

        <div className="mt-6">
          <Button
            danger
            type="primary"
            loading={isSubmitting}
            disabled={!isConfirmed}
            onClick={handleSubmit(onSubmit)}
            icon={<DeleteOutlined />}
          >
            {t("profile.deleteAccountButton")}
          </Button>
        </div>
      </ContainerTitle>
    </form>
  );
};

export default DeleteAccount;
